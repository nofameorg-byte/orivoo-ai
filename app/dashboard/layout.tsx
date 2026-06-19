import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bot,
  Braces,
  Building2,
  FileText,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Globe2,
  Landmark,
  Layers3,
  Leaf,
  LogOut,
  Palette,
  Scale,
  Search,
  Settings,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { LanguageSelector } from "@/components/core/language-selector";
import { NotificationBell } from "@/components/core/notification-bell";
import { getRecentNotifications } from "@/lib/core/notifications";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/dictionaries";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

const navigation = [
  { labelKey: "nav.assistant", icon: Bot, href: "/dashboard" },
  { labelKey: "nav.projects", icon: FolderKanban, href: "/dashboard/projects" },
  {
    labelKey: "nav.documents",
    icon: FileText,
    href: "/dashboard/document-studio",
  },
  { labelKey: "nav.research", icon: Search, href: "/dashboard/research" },
  { labelKey: "nav.websites", icon: Globe2, href: "/dashboard/websites" },
  { labelKey: "nav.code", icon: Braces, href: "/dashboard/code" },
  { labelKey: "nav.academy", icon: GraduationCap, href: "/dashboard/academy" },
  { labelKey: "nav.business", icon: Building2, href: "/dashboard#workspace" },
  { labelKey: "nav.design", icon: Palette, href: "/dashboard#workspace" },
  { labelKey: "nav.land", icon: Trees, href: "/dashboard#workspace" },
  { labelKey: "nav.concept", icon: Layers3, href: "/dashboard#workspace" },
  { labelKey: "nav.legal", icon: Scale, href: "/dashboard#workspace" },
  { labelKey: "nav.civic", icon: Landmark, href: "/dashboard#workspace" },
  { labelKey: "nav.botanical", icon: Leaf, href: "/dashboard#workspace" },
  { labelKey: "nav.genealogy", icon: Users, href: "/dashboard#workspace" },
  { labelKey: "nav.science", icon: FlaskConical, href: "/dashboard#workspace" },
  { labelKey: "nav.settings", icon: Settings, href: "/dashboard/settings" },
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
    redirect("/login?message=Login to access your ORIVOO AI dashboard.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,language,is_super_admin")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user.email?.split("@")[0] ?? "Operator");
  const locale = isLocale(profile?.language) ? profile.language : defaultLocale;
  const t = createTranslator(locale);
  const notifications = await getRecentNotifications(user.id);
  const navigationItems = profile?.is_super_admin
    ? [
        ...navigation,
        { labelKey: "nav.admin", icon: Settings, href: "/dashboard/admin" },
      ]
    : navigation;

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <LanguageProvider locale={locale}>
      <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-panel/95 p-4 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold tracking-[0.2em] text-white">
              ORIVOO AI
            </p>
            <p className="text-xs text-muted">Intelligent Studio OS</p>
          </div>
        </Link>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigationItems.map((item, index) => (
            <Link
              key={item.labelKey}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                index === 0
                  ? "border border-gold/25 bg-gold/10 text-gold-bright"
                  : "text-muted hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon
                className={`size-4 ${
                  index === 0 ? "text-gold" : "text-muted group-hover:text-gold"
                }`}
                aria-hidden
              />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-3xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm font-semibold text-gold-bright">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
          <div className="mt-4">
            <div className="mb-3">
              <NotificationBell notifications={notifications} />
            </div>
            <LanguageSelector locale={locale} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="gold-gradient flex size-9 items-center justify-center rounded-xl text-black">
                <Sparkles className="size-4" aria-hidden />
              </div>
              <span className="font-semibold tracking-[0.16em]">ORIVOO AI</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="rounded-full border border-white/10 p-2 text-muted"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
            <NotificationBell notifications={notifications} />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navigationItems.map((item) => (
              <Link
                key={item.labelKey}
                href={item.href}
                className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs text-muted"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <LanguageSelector locale={locale} />
          </div>
        </header>

        <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
    </LanguageProvider>
  );
}
