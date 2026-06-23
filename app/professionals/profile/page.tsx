import { FileText, Image, MessageSquare, ShieldCheck } from "lucide-react";
import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function ProfessionalProfilePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const fields = list(dictionary.profile.fields);
  const badges = list(dictionary.verification.badges);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/professionals/profile"
      />
      <PageHero
        badge={t(dictionary, "profile.badge")}
        title={t(dictionary, "profile.headline")}
        body={t(dictionary, "profile.body")}
        primaryAction={{
          href: "/quotes",
          label: t(dictionary, "profile.quoteCta"),
        }}
      />
      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
              <FileText className="size-6 text-gold" aria-hidden />
              {t(dictionary, "profile.contactTitle")}
            </h2>
            <div className="mt-5">
              <Checklist items={fields} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <Image className="mb-5 size-7 text-gold" aria-hidden />
              <h2 className="text-xl font-black text-foreground">
                {t(dictionary, "profile.portfolioTitle")}
              </h2>
            </div>
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <MessageSquare className="mb-5 size-7 text-gold" aria-hidden />
              <h2 className="text-xl font-black text-foreground">
                {t(dictionary, "profile.reviewsTitle")}
              </h2>
            </div>
          </div>
        </div>
        <aside className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <ShieldCheck className="size-6 text-gold" aria-hidden />
            {t(dictionary, "verification.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {t(dictionary, "verification.body")}
          </p>
          <div className="mt-6 grid gap-2">
            {badges.map((badge) => (
              <div
                key={badge}
                className="rounded-2xl border border-border bg-gold/10 p-3 text-sm font-medium text-foreground"
              >
                {badge}
              </div>
            ))}
          </div>
        </aside>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
