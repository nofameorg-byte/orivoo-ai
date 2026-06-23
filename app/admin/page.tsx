import { redirect } from "next/navigation";
import { Clock, ShieldCheck } from "lucide-react";
import { CardGrid, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const sections = list(dictionary.admin.sections).map((section) => ({
    title: section,
    body: t(dictionary, "common.ready"),
  }));
  const queueItems = list(dictionary.trustV2.queueItems);
  const reviewQueue = list(dictionary.reviewsV2.queueItems);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/admin" />
      <PageHero
        badge={t(dictionary, "admin.badge")}
        title={t(dictionary, "admin.headline")}
        body={t(dictionary, "admin.body")}
      />
      <section className="section-shell pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
                <ShieldCheck className="size-6 text-gold" aria-hidden />
                {t(dictionary, "trustV2.adminQueueTitle")}
              </h2>
              <div className="mt-5 grid gap-3">
                {queueItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-panel-soft p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted">{item.company}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-deep">
                        <Clock className="size-3" aria-hidden />
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="text-2xl font-black text-foreground">
                {t(dictionary, "reviewsV2.moderationQueue")}
              </h2>
              <div className="mt-5 grid gap-3">
                {reviewQueue.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-semibold text-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CardGrid items={sections} />
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
