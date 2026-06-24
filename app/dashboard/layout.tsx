import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
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
    redirect("/login?message=Login to access your VP23 Financial dashboard.");
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-panel/95 p-4 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="mb-6 px-2">
          <VP23Logo size="md" />
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {dashboardNavigation.map((item, index) => (
            <Link
              key={item.name}
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
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-3xl border border-white/10 bg-black/40 p-4">
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
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/75 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <VP23Logo size="sm" />
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
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
                className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs text-muted"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </header>

        <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
          <footer className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs leading-5 text-muted">
            VP23 is a financial technology platform operated by Versatile
            Partners 23, LLC. Banking services are subject to approval by
            regulated banking partners. Features shown may be in development and
            are not available until partner approval.
          </footer>
        </main>
      </div>
    </div>
  );
}
