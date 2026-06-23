import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const title = `${t(dictionary, "brand.name")} - ${t(dictionary, "brand.tagline")}`;
  const description = t(dictionary, "landing.body");

  return {
    title: {
      default: title,
      template: `%s | ${t(dictionary, "brand.name")}`,
    },
    description,
    applicationName: t(dictionary, "brand.name"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    openGraph: {
      title,
      description,
      siteName: t(dictionary, "brand.name"),
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-theme="dark">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
