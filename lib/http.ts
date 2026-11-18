import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) throw new ApiError(403, "Invalid request origin.");
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: "Invalid input.", fields: error.flatten().fieldErrors }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ error: "This record already exists." }, { status: 409 });
  }
  console.error("API request failed", error);
  return NextResponse.json({ error: "Unable to complete the request." }, { status: 500 });
}
