import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { LISTING_STATUS } from "@/lib/commerce";
import { analyseContent } from "@/lib/moderation";
import { listingSchema } from "@/lib/validators";
import { ApiError, assertSameOrigin, handleApiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.slice(0, 100) ?? "";
    const category = request.nextUrl.searchParams.get("category")?.slice(0, 80) ?? "";
    const listings = await prisma.listing.findMany({
      where: {
        status: LISTING_STATUS.ACTIVE,
        sellerProfile: { is: { verified: true } },
        ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
        ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
      },
      select: {
        id: true, title: true, description: true, origin: true, category: true,
        priceMinor: true, currency: true, stock: true,
        sellerProfile: { select: { id: true, name: true, verified: true } },
      },
      orderBy: { createdAt: "desc" }, take: 50,
    });
    return NextResponse.json({ listings });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    if (!user.seller) throw new ApiError(403, "Create a seller profile first.");
    const input = listingSchema.parse(await request.json());
    if (!analyseContent(`${input.title} ${input.description}`).approved) {
      throw new ApiError(422, "Remove contact information or off-platform payment instructions from the listing.");
    }
    const listing = await prisma.listing.create({ data: {
      ...input, price: input.priceMinor / 100, currency: "gbp", seller: user.seller.name,
      sellerId: user.seller.id, status: LISTING_STATUS.PENDING_REVIEW,
    } });
    return NextResponse.json({ listing, message: "Listing submitted for review." }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
