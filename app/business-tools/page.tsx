import { CardGrid, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function BusinessToolsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const modules = list(dictionary.tools.modules);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/business-tools"
      />
      <PageHero
        badge={t(dictionary, "tools.badge")}
        title={t(dictionary, "tools.headline")}
        body={t(dictionary, "tools.body")}
      />
      <section className="section-shell pb-16">
        <CardGrid items={modules} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
