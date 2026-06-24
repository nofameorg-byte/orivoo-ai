import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { LanguageTabs } from "@/components/language-tabs";
import { VP23Logo } from "@/components/vp23-logo";
import { dashboardNavigation } from "@/lib/vp23/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
    redirect("/login?message=Login to access your VP23 dashboard.");
  }

  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user.email?.split("@")[0] ?? "Operator";

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 border-r border-gold/15 bg-gradient-to-b from-[#0f0f12] via-black to-[#130609] p-4 shadow-2xl shadow-metal-red/10 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="mb-6 rounded-[2rem] border border-gold/20 bg-black/45 p-4 red-glow">
          <VP23Logo size="lg" />
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-gold">
            Business command center
          </p>
          <div className="mt-4">
            <LanguageTabs compact />
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {dashboardNavigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                index === 0
                  ? "border border-gold/40 bg-gradient-to-r from-metal-red/30 to-gold/15 text-gold-bright shadow-lg shadow-metal-red/10"
                  : "text-muted hover:border hover:border-gold/20 hover:bg-gold/10 hover:text-white"
              }`}
            >
              <item.icon
                className={`size-4 ${
                  index === 0 ? "text-gold" : "text-muted group-hover:text-gold"
                }`}
                aria-hidden
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-black via-panel to-metal-red/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-metal-red/40 bg-metal-red/10 text-sm font-semibold text-metal-red-bright">
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
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/25 px-3 py-2 text-sm text-muted transition hover:border-gold hover:bg-gold/10 hover:text-gold-bright"
            >
              <LogOut className="size-4" aria-hidden />
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-gold/15 bg-black/85 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <VP23Logo size="sm" />
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Logout"
                className="rounded-full border border-white/10 p-2 text-muted"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {dashboardNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs ${
                  item.name === "Dashboard"
                    ? "gold-cta border-gold/40 text-black"
                    : "border-white/10 text-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </header>

        <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
          <footer className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-gold/15 pt-6 text-xs leading-5 text-muted md:flex-row md:items-center md:justify-between">
            <p>© VP23 — A product of Versatile Partners 23, LLC</p>
            <div className="flex flex-wrap gap-4">
              <a href="mailto:contact@vp-23.com" className="text-gold-bright hover:text-white">
                contact@vp-23.com
              </a>
              <Link href="/dashboard/settings/legal" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/dashboard/settings/legal" className="hover:text-white">
                Terms
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
