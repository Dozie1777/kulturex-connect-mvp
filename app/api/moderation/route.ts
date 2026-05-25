import { NextResponse } from "next/server";
import { moderationSchema } from "@/lib/validators";
const contactPatterns = [/\b\+?\d[\d\s().-]{7,}\d\b/, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, /whatsapp|telegram|call me|text me|dm me/i];
export async function POST(request: Request) {
  const body = await request.json();
  const data = moderationSchema.parse(body);
  const flags = contactPatterns.map(pattern => pattern.test(data.content)).filter(Boolean).length;
  return NextResponse.json({ approved: flags === 0, riskLevel: flags === 0 ? "low" : flags === 1 ? "medium" : "high", message: flags === 0 ? "Content passed moderation checks." : "Content may contain personal contact details or off-platform transaction wording." });
}
