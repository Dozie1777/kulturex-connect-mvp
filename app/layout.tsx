import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kulturex Connect", description: "Cultural marketplace MVP for diaspora commerce." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
