import { Camera, ClipboardList, Send } from "lucide-react";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";

export default async function QuotesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/quotes" />
      <PageHero
        badge={t(dictionary, "quotes.badge")}
        title={t(dictionary, "quotes.headline")}
        body={t(dictionary, "quotes.body")}
      />
      <section className="section-shell grid gap-4 pb-16 md:grid-cols-3">
        {[
          { title: t(dictionary, "quotes.requestDetails"), icon: ClipboardList },
          { title: t(dictionary, "quotes.projectPhotos"), icon: Camera },
          { title: t(dictionary, "quotes.sendRequest"), icon: Send },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-border bg-panel p-6"
          >
            <item.icon className="mb-5 size-7 text-gold" aria-hidden />
            <h2 className="text-xl font-black text-foreground">{item.title}</h2>
          </div>
        ))}
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
