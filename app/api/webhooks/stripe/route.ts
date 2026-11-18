import { NextRequest, NextResponse } from "next/server";
import { processCheckoutEvent, stripeClient } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event;
  try {
    event = stripeClient().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await processCheckoutEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe event processing failed", { eventId: event.id, error });
    // Stripe should retry transient failures, including missing order-session correlation.
    return NextResponse.json({ error: "Unable to process event." }, { status: 500 });
  }
}
