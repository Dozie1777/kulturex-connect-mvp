import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { calculateTotal, LISTING_STATUS, ORDER_STATUS, mayReleaseInventory } from "@/lib/commerce";
import { ApiError } from "@/lib/http";

// Test mode is intentional until operational, compliance and fulfilment reviews are completed.
export function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secret.startsWith("sk_test_")) {
    throw new ApiError(503, "Test-mode payment processing is not configured.");
  }
  return new Stripe(secret);
}

export function publicBaseUrl() {
  const raw = process.env.APP_BASE_URL;
  if (!raw) throw new ApiError(503, "APP_BASE_URL is not configured.");
  const url = new URL(raw);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")) {
    throw new ApiError(503, "A secure APP_BASE_URL is required.");
  }
  return url.origin;
}

export async function reserveOrder(buyer: { id: string; name: string; seller?: { id: string } | null }, listingId: string, quantity: number) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findFirst({
      where: { id: listingId, status: LISTING_STATUS.ACTIVE, sellerProfile: { is: { verified: true } } },
      include: { sellerProfile: true },
    });
    if (!listing || !listing.sellerProfile || listing.priceMinor === null) {
      throw new ApiError(404, "This listing cannot currently be purchased.");
    }
    if (buyer.seller?.id === listing.sellerId) throw new ApiError(403, "You cannot purchase your own listing.");
    if (listing.stock < quantity) throw new ApiError(409, "Not enough stock available.");
    const amountMinor = calculateTotal(listing.priceMinor, quantity);
    const reservation = await tx.listing.updateMany({
      where: { id: listing.id, stock: { gte: quantity }, status: LISTING_STATUS.ACTIVE },
      data: { stock: { decrement: quantity } },
    });
    if (!reservation.count) throw new ApiError(409, "Stock changed; please try again.");
    const order = await tx.order.create({ data: {
      buyerId: buyer.id, buyer: buyer.name, listingId: listing.id, sellerId: listing.sellerId,
      item: listing.title, amount: amountMinor / 100, amountMinor, currency: "gbp", quantity,
      status: ORDER_STATUS.PENDING_PAYMENT, payoutStatus: "NOT_CONFIGURED",
      paymentExpiresAt: new Date(Date.now() + 35 * 60_000),
    } });
    return { order, listing };
  });
}

export async function releaseOrderReservation(orderId: string, status: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || !mayReleaseInventory(order.status)) return;
    const result = await tx.order.updateMany({
      where: { id: orderId, status: ORDER_STATUS.PENDING_PAYMENT },
      data: { status },
    });
    if (result.count && order.listingId) {
      await tx.listing.update({ where: { id: order.listingId }, data: { stock: { increment: order.quantity } } });
    }
  });
}

export async function processCheckoutEvent(event: Stripe.Event) {
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) return;
  const session = event.data.object as Stripe.Checkout.Session;
  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (!order) throw new Error(`Checkout session ${session.id} is not linked to an order.`);
  if (event.type === "checkout.session.expired") {
    await releaseOrderReservation(order.id, ORDER_STATUS.EXPIRED);
    return;
  }
  if (event.type === "checkout.session.async_payment_failed") {
    await releaseOrderReservation(order.id, ORDER_STATUS.PAYMENT_FAILED);
    return;
  }
  // A completed session can still be unpaid for asynchronous payment methods.
  if (session.payment_status === "paid" || event.type === "checkout.session.async_payment_succeeded") {
    await prisma.order.updateMany({
      where: { id: order.id, status: ORDER_STATUS.PENDING_PAYMENT },
      data: { status: ORDER_STATUS.PAID },
    });
  }
}
