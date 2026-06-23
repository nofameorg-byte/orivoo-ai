import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function EquipmentPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const modules = list(dictionary.equipment.modules);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/equipment" />
      <PageHero
        badge={t(dictionary, "equipment.badge")}
        title={t(dictionary, "equipment.headline")}
        body={t(dictionary, "equipment.body")}
      />
      <section className="section-shell pb-16">
        <Checklist items={modules} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
