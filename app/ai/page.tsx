import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function AiPrepPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const modules = list(dictionary.ai.modules);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/ai" />
      <PageHero
        badge={t(dictionary, "ai.badge")}
        title={t(dictionary, "ai.headline")}
        body={t(dictionary, "ai.body")}
      />
      <section className="section-shell pb-16">
        <Checklist items={modules} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
