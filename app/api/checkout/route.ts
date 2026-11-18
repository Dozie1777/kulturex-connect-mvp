import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS } from "@/lib/commerce";
import { checkoutSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { publicBaseUrl, releaseOrderReservation, reserveOrder, stripeClient } from "@/lib/payments";
import { assertSameOrigin, handleApiError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = checkoutSchema.parse(await request.json());
    // Check configuration before reserving stock.
    const stripe = stripeClient();
    const base = publicBaseUrl();
    const { order, listing } = await reserveOrder(user, input.listingId, input.quantity);
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: order.id,
        customer_email: user.email,
        line_items: [{ price_data: {
          currency: "gbp", unit_amount: listing.priceMinor!,
          product_data: { name: listing.title, description: listing.description.slice(0, 500) },
        }, quantity: input.quantity }],
        success_url: `${base}/orders?checkout=success`,
        cancel_url: `${base}/marketplace?checkout=cancelled`,
        expires_at: Math.floor(order.paymentExpiresAt!.getTime() / 1000),
        metadata: { orderId: order.id },
      }, { idempotencyKey: order.id });
    } catch (error) {
      await releaseOrderReservation(order.id, ORDER_STATUS.PAYMENT_FAILED);
      throw error;
    }
    try {
      await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    } catch (error) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      await releaseOrderReservation(order.id, ORDER_STATUS.PAYMENT_FAILED);
      throw error;
    }
    return NextResponse.json({ orderId: order.id, checkoutUrl: session.url });
  } catch (error) { return handleApiError(error); }
}
