import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, handleApiError } from "@/lib/http";
import { clearSessionCookie, hashSessionToken, sessionTokenFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const token = sessionTokenFromRequest(request);
    if (token) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) { return handleApiError(error); }
}
