import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
export { hashPassword, verifyPassword } from "@/lib/password";
const SESSION_COOKIE = "kulturex_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function issueSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: { userId, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_AGE_SECONDS * 1000) },
  });
  return token;
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: SESSION_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 0,
  });
}

export function sessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value;
}

export async function sessionUser(token: string | undefined) {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: { include: { seller: true } } },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function requireUser(request: NextRequest) {
  const user = await sessionUser(sessionTokenFromRequest(request));
  if (!user) throw new ApiError(401, "Please sign in.");
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") throw new ApiError(403, "Administrator access required.");
  return user;
}
