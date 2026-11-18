import { NextRequest, NextResponse } from "next/server";
import { sessionUser, sessionTokenFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const user = await sessionUser(sessionTokenFromRequest(request));
    return NextResponse.json({ user: user ? {
      id: user.id, name: user.name, email: user.email, role: user.role,
      seller: user.seller ? { id: user.seller.id, verified: user.seller.verified } : null,
    } : null });
  } catch (error) { return handleApiError(error); }
}
