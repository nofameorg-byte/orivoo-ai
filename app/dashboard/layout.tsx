import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return {
    title: t(dictionary, "dashboard.title"),
  };
}

const navigation = [
  { href: "/dashboard", labelKey: "professionalDashboard.overview", icon: LayoutDashboard },
  { href: "/professionals/profile", labelKey: "professionalDashboard.companyProfile", icon: Building2 },
  { href: "/professionals/profile", labelKey: "professionalDashboard.reviews", icon: MessageSquare },
  { href: "/document-center", labelKey: "professionalDashboard.licenses", icon: BadgeCheck },
  { href: "/document-center", labelKey: "professionalDashboard.insurance", icon: ShieldCheck },
  { href: "/dashboard/quotes", labelKey: "professionalDashboard.quotes", icon: ClipboardList },
  { href: "/dashboard/jobs", labelKey: "professionalDashboard.jobs", icon: FileText },
  { href: "/dashboard/notifications", labelKey: "notifications.title", icon: Bell },
  { href: "/document-center", labelKey: "professionalDashboard.documents", icon: FileText },
  { href: "/partners", labelKey: "professionalDashboard.partners", icon: Handshake },
  { href: "/dashboard", labelKey: "professionalDashboard.settings", icon: Settings },
  { href: "/admin", labelKey: "routes.admin", icon: Users },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, preferred_language, role")
    .eq("id", user.id)
    .maybeSingle();

  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user.email?.split("@")[0] ?? t(dictionary, "common.professional"));
  const role = profile?.role ? String(profile.role) : t(dictionary, "common.customer");
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-panel/95 p-4 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black">
            <Building2 className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-black tracking-[0.22em] text-foreground">
              {t(dictionary, "brand.name")}
            </p>
            <p className="text-xs text-muted">{t(dictionary, "brand.tagline")}</p>
          </div>
        </Link>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                index === 0
                  ? "border border-gold/25 bg-gold/10 text-gold-bright"
                  : "text-muted hover:bg-panel-soft hover:text-foreground"
              }`}
            >
              <item.icon
                className={`size-4 ${
                  index === 0 ? "text-gold" : "text-muted group-hover:text-gold"
                }`}
                aria-hidden
              />
              {t(dictionary, item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-3xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm font-bold text-gold-bright">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted">{role}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <LanguageSelector
              currentLocale={locale as Locale}
              redirectTo="/dashboard"
              label={t(dictionary, "common.language")}
              names={{
                en: t(dictionary, "common.english"),
                es: t(dictionary, "common.spanish"),
              }}
            />
            <ThemeToggle
              label={t(dictionary, "common.theme")}
              lightLabel={t(dictionary, "common.light")}
              darkLabel={t(dictionary, "common.dark")}
            />
          </div>
          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden />
              {t(dictionary, "common.signOut")}
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="gold-gradient flex size-9 items-center justify-center rounded-xl text-black">
                <Building2 className="size-4" aria-hidden />
              </div>
              <span className="font-black tracking-[0.16em]">
                {t(dictionary, "brand.name")}
              </span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                aria-label={t(dictionary, "common.signOut")}
                className="rounded-full border border-border p-2 text-muted"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-border px-3 py-2 text-xs text-muted"
              >
                {t(dictionary, item.labelKey)}
              </Link>
            ))}
          </div>
        </header>

        <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
