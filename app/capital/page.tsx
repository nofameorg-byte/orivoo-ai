import { AlertTriangle } from "lucide-react";
import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function CapitalPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const capitalTypes = list(dictionary.capital.types);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/capital" />
      <PageHero
        badge={t(dictionary, "capital.badge")}
        title={t(dictionary, "capital.headline")}
        body={t(dictionary, "capital.body")}
      />
      <section className="section-shell space-y-6 pb-16">
        <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5 text-sm font-medium text-foreground">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
            <p>{t(dictionary, "capital.disclaimer")}</p>
          </div>
        </div>
        <Checklist items={capitalTypes} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
