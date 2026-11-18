import { NextRequest, NextResponse } from "next/server";
import { analyseContent } from "@/lib/moderation";
import { moderationSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const { content } = moderationSchema.parse(await request.json());
    return NextResponse.json(analyseContent(content));
  } catch (error) { return handleApiError(error); }
}
