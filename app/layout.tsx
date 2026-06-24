import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "VP23 Financial - Premium sandbox banking",
    template: "%s | VP23 Financial",
  },
  description:
    "VP23 Financial is a Next.js 16 fintech MVP with Supabase auth, RLS-ready data, invoices, transfers, and secure Column sandbox backend routes.",
  applicationName: "VP23 Financial",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "VP23 Financial",
    description:
      "Aggressive premium fintech banking dashboard powered by Next.js, Supabase, and Column sandbox APIs.",
    siteName: "VP23 Financial",
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
