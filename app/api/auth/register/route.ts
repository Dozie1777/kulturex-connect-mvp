import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { attachSessionCookie, hashPassword, issueSession } from "@/lib/auth";
import { assertSameOrigin, handleApiError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = registerSchema.parse(await request.json());
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password) },
      select: { id: true, name: true, email: true, role: true },
    });
    const token = await issueSession(user.id);
    const response = NextResponse.json({ user }, { status: 201 });
    attachSessionCookie(response, token);
    return response;
  } catch (error) { return handleApiError(error); }
}
