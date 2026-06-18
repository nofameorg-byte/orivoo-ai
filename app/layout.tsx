import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ORIVOO AI - Build with intelligent studios",
    template: "%s | ORIVOO AI",
  },
  description:
    "ORIVOO AI is a modern AI operating system for documents, research, websites, code, business, design, and specialized studios.",
  applicationName: "ORIVOO AI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "ORIVOO AI",
    description:
      "A modern SaaS workspace for AI-assisted creation, research, and business operations.",
    siteName: "ORIVOO AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
