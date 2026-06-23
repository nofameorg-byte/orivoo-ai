import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Checklist, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";

export default async function ProfessionalsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const filters = list(dictionary.directory.filters);
  const categories = list(dictionary.categories);
  const profiles = list(dictionary.directory.sampleProfiles);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/professionals" />
      <PageHero
        badge={t(dictionary, "directory.badge")}
        title={t(dictionary, "directory.headline")}
        body={t(dictionary, "directory.body")}
        primaryAction={{
          href: "/quotes",
          label: t(dictionary, "profile.quoteCta"),
        }}
      />
      <section className="section-shell space-y-10 pb-16">
        <div>
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "directory.filtersTitle")}
          </h2>
          <div className="mt-5">
            <Checklist items={filters} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "directory.categoriesTitle")}
          </h2>
          <div className="mt-5">
            <Checklist items={categories} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {profiles.map((profile) => (
            <article
              key={profile.company}
              className="rounded-3xl border border-border bg-panel p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <BadgeCheck className="size-7 text-gold" aria-hidden />
                <div className="flex items-center gap-1 text-sm font-bold text-gold">
                  <Star className="size-4 fill-gold" aria-hidden />
                  {profile.rating}
                </div>
              </div>
              <h3 className="text-xl font-black text-foreground">
                {profile.company}
              </h3>
              <p className="mt-2 text-sm text-muted">{profile.owner}</p>
              <div className="mt-5 space-y-2 text-sm text-muted">
                <p>{profile.category}</p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-gold" aria-hidden />
                  {profile.location}
                </p>
                <p>{profile.language}</p>
              </div>
              <Link
                href="/professionals/profile"
                className="mt-6 inline-flex rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:border-gold/50"
              >
                {t(dictionary, "directory.profileCta")}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
