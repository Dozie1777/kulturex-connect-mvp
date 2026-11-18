import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { attachSessionCookie, issueSession, verifyPassword } from "@/lib/auth";
import { ApiError, assertSameOrigin, handleApiError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password.");
    }
    const token = await issueSession(user.id);
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    attachSessionCookie(response, token);
    return response;
  } catch (error) { return handleApiError(error); }
}
