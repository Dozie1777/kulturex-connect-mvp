import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sellerSchema } from "@/lib/validators";
import { ApiError, assertSameOrigin, handleApiError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    if (user.seller) throw new ApiError(409, "You already have a seller profile.");
    const input = sellerSchema.parse(await request.json());
    const seller = await prisma.seller.create({ data: { ...input, ownerId: user.id } });
    return NextResponse.json({ seller, message: "Your seller profile is awaiting verification." }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
