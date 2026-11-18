import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { assertSameOrigin, handleApiError } from "@/lib/http";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await params;
    const result = await prisma.seller.updateMany({ where: { id }, data: { verified: true } });
    return NextResponse.json({ verified: result.count === 1 }, { status: result.count ? 200 : 404 });
  } catch (error) { return handleApiError(error); }
}
