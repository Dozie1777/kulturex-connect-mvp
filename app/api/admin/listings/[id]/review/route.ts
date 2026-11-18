import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { LISTING_STATUS } from "@/lib/commerce";
import { prisma } from "@/lib/prisma";
import { ApiError, assertSameOrigin, handleApiError } from "@/lib/http";

const reviewSchema = z.object({ approved: z.boolean() }).strict();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { approved } = reviewSchema.parse(await request.json());
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id }, include: { sellerProfile: true },
    });
    if (!listing) throw new ApiError(404, "Listing not found.");
    if (listing.status !== LISTING_STATUS.PENDING_REVIEW) throw new ApiError(409, "Listing has already been reviewed.");
    if (approved && (!listing.sellerProfile?.verified || listing.priceMinor === null)) {
      throw new ApiError(409, "Seller must be verified and listing priced before approval.");
    }
    const result = await prisma.listing.updateMany({
      where: { id, status: LISTING_STATUS.PENDING_REVIEW },
      data: { status: approved ? LISTING_STATUS.ACTIVE : LISTING_STATUS.REJECTED },
    });
    if (!result.count) throw new ApiError(409, "Listing was reviewed by another request.");
    return NextResponse.json({ status: approved ? LISTING_STATUS.ACTIVE : LISTING_STATUS.REJECTED });
  } catch (error) { return handleApiError(error); }
}
