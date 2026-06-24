import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["600", "700"],
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
      <body className={`${inter.variable} ${barlowCondensed.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
