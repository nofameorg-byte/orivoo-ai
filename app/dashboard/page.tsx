import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  ClipboardList,
  FileText,
  Handshake,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const operatingAreas = [
  { href: "/professionals", labelKey: "routes.directory", icon: Search },
  { href: "/quotes", labelKey: "routes.quotes", icon: ClipboardList },
  { href: "/business-tools", labelKey: "routes.tools", icon: Building2 },
  { href: "/document-center", labelKey: "routes.documents", icon: FileText },
  { href: "/partners", labelKey: "routes.partners", icon: Handshake },
  { href: "/equipment", labelKey: "routes.equipment", icon: Truck },
  { href: "/ai", labelKey: "routes.ai", icon: Bot },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, preferred_language")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0] ?? t(dictionary, "common.professional"));
  const metrics = list(dictionary.dashboard.metrics);
  const badges = list(dictionary.verification.badges);
  const quickActions = list(dictionary.dashboard.quickActions);

  return (
    <div className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <ShieldCheck className="size-4" aria-hidden />
              {t(dictionary, "dashboard.badge")}
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {t(dictionary, "dashboard.welcome", { name: displayName })}
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              {t(dictionary, "dashboard.body")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-border bg-background/50 p-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="text-2xl font-black text-foreground">
            {t(dictionary, "dashboard.sectionsTitle")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {operatingAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-3xl border border-border bg-panel-soft p-5 transition hover:-translate-y-1 hover:border-gold/50"
              >
                <area.icon className="mb-5 size-6 text-gold" aria-hidden />
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-foreground">
                    {t(dictionary, area.labelKey)}
                  </h3>
                  <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "verification.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {t(dictionary, "verification.body")}
            </p>
            <div className="mt-6 grid gap-2">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-gold/10 p-3 text-sm font-medium text-foreground"
                >
                  <BadgeCheck className="size-5 text-gold" aria-hidden />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-panel p-6">
            <h2 className="text-2xl font-black text-foreground">
              {t(dictionary, "dashboard.quickActionsTitle")}
            </h2>
            <div className="mt-5 grid gap-2">
              {quickActions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-border bg-panel-soft p-3 text-sm text-muted"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
