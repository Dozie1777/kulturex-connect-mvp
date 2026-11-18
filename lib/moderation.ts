const contactPatterns = [
  /\b\+?\d[\d\s().-]{7,}\d\b/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:whatsapp|telegram|call me|text me|dm me)\b/i,
];

export function analyseContent(content: string) {
  const flags = contactPatterns.reduce((count, pattern) => count + Number(pattern.test(content)), 0);
  return {
    approved: flags === 0,
    riskLevel: flags === 0 ? "low" : flags === 1 ? "medium" : "high",
    message: flags === 0
      ? "Content passed automated contact-sharing checks."
      : "Content may contain personal contact details or off-platform transaction wording.",
  } as const;
}
