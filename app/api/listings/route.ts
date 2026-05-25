import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators";
export async function GET() { try { const listings = await prisma.listing.findMany({ orderBy:{ createdAt:"desc" } }); return NextResponse.json(listings); } catch { return NextResponse.json({ error:"Failed to fetch listings." }, { status:500 }); } }
export async function POST(request: Request) { try { const body = await request.json(); const data = listingSchema.parse(body); const listing = await prisma.listing.create({ data }); return NextResponse.json(listing, { status:201 }); } catch { return NextResponse.json({ error:"Failed to create listing." }, { status:400 }); } }
