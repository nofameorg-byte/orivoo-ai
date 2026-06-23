import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function DocumentCenterPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const documentTypes = list(dictionary.documents.types);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/document-center"
      />
      <PageHero
        badge={t(dictionary, "documents.badge")}
        title={t(dictionary, "documents.headline")}
        body={t(dictionary, "documents.body")}
      />
      <section className="section-shell pb-16">
        <Checklist items={documentTypes} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
