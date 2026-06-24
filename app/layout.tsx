import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "VP23 - Business money operations",
    template: "%s | VP23",
  },
  description:
    "VP23 helps businesses organize customers, invoices, documents, ledger records, and account-readiness workflows.",
  applicationName: "VP23",
  manifest: "/site.webmanifest",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/vp23-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "VP23",
    description:
      "Premium business money operations platform for customers, invoices, documents, and account-readiness workflows.",
    siteName: "VP23",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VP23",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VP23",
    description:
      "Premium business money operations platform for VP23.",
    images: ["/social-image.png"],
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
