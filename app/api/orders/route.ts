import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const orders = await prisma.order.findMany({
      where: { OR: [ { buyerId: user.id }, ...(user.seller ? [{ sellerId: user.seller.id }] : []) ] },
      select: {
        id: true, item: true, quantity: true, amountMinor: true, currency: true,
        status: true, payoutStatus: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" }, take: 100,
    });
    return NextResponse.json({ orders });
  } catch (error) { return handleApiError(error); }
}
