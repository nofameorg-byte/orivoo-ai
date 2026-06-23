import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function PartnersPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const partnerTypes = list(dictionary.partners.types);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/partners" />
      <PageHero
        badge={t(dictionary, "partners.badge")}
        title={t(dictionary, "partners.headline")}
        body={t(dictionary, "partners.body")}
        primaryAction={{
          href: "/capital",
          label: t(dictionary, "partners.contactPartner"),
        }}
      />
      <section className="section-shell pb-16">
        <Checklist items={partnerTypes} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
