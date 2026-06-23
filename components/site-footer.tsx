import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/server";

type SiteFooterProps = {
  dictionary: Dictionary;
};

const footerLinks = [
  { href: "/professionals", labelKey: "nav.directory" },
  { href: "/quotes", labelKey: "routes.quotes" },
  { href: "/document-center", labelKey: "routes.documents" },
  { href: "/capital", labelKey: "routes.capital" },
  { href: "/admin", labelKey: "routes.admin" },
];

export function SiteFooter({ dictionary }: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.4fr] lg:px-8">
        <div>
          <p className="text-xl font-black tracking-[0.22em]">
            {t(dictionary, "brand.name")}
          </p>
          <p className="mt-2 text-sm text-muted">
            {t(dictionary, "brand.meaning")}
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            {t(dictionary, "brand.marketplace")}
          </p>
        </div>
        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-border bg-panel-soft px-4 py-3 text-sm text-muted transition hover:border-gold/50 hover:text-foreground"
            >
              {t(dictionary, link.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
