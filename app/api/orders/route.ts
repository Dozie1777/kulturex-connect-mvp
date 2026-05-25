import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id:"ORD-1001", buyer:"Demo Buyer", item:"Premium Jollof Rice Spice", status:"Delivered", payoutStatus:"Ready" },
    { id:"ORD-1002", buyer:"Demo Buyer", item:"Ankara Tote Bag", status:"In transit", payoutStatus:"Pending" }
  ]);
}
