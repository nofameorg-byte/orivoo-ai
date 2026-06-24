import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { VP23Logo } from "@/components/vp23-logo";

export const metadata: Metadata = {
  title: "Sign up",
};

type AuthPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: AuthPageProps) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50 md:grid-cols-[0.9fr_1fr]">
        <section className="p-8 sm:p-10">
          <VP23Logo size="md" />

          <h1 className="mt-12 text-3xl font-semibold text-white">
            Create your VP23 workspace
          </h1>
          <p className="mt-3 text-sm text-muted">
            Launch a secure VP23 workspace for customers, invoices, documents,
            and account-readiness workflows.
          </p>

          {message ? (
            <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
              {message}
            </div>
          ) : null}

          <form action={signUp} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-white">
                Display name
              </span>
              <input
                name="displayName"
                type="text"
                autoComplete="name"
                maxLength={80}
                placeholder="Alex Morgan"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Email</span>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Password</span>
              <input
                required
                minLength={8}
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <button
              type="submit"
              className="gold-cta group flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-black transition hover:scale-[1.01]"
            >
              Create VP23 account
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-gold-bright">
              Login
            </Link>
          </p>
        </section>

        <section className="hidden bg-black/70 p-10 md:block">
          <div className="surface-card mt-12 rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Application stack
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Customers, invoices, documents, and review workflows.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              Built for business owners who need organized customers, invoices,
              documents, and account-readiness workflows in one place.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { label: "Protected routes", icon: ShieldCheck },
                { label: "Business profile", icon: Building2 },
                { label: "Server-only API keys", icon: ShieldCheck },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white"
                >
                  <item.icon className="size-5 text-electric-blue-bright" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
