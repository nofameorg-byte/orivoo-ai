import { redirect } from "next/navigation";
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

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/admin" />
      <PageHero
        badge={t(dictionary, "admin.badge")}
        title={t(dictionary, "admin.headline")}
        body={t(dictionary, "admin.body")}
      />
      <section className="section-shell pb-16">
        <CardGrid items={sections} />
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
