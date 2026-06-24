import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { signIn } from "@/app/actions/auth";
import { LanguageTabs } from "@/components/language-tabs";
import { VP23Logo } from "@/components/vp23-logo";

export const metadata: Metadata = {
  title: "Login",
};

type AuthPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50 md:grid-cols-[1fr_0.9fr]">
        <section className="hidden bg-black/70 p-10 md:block">
          <VP23Logo size="md" />
          <div className="mt-24">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              Welcome to VP23.
            </h1>
            <p className="mt-5 leading-7 text-muted">
              Access customers, invoices, documents, ledger records, and
              account-readiness workflows from one secure workspace.
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mb-10 md:hidden">
            <VP23Logo size="md" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/30 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
            <LockKeyhole className="size-3.5" aria-hidden />
            Secure login
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white">Login</h2>
          <p className="mt-3 text-sm text-muted">
              Access your VP23 workspace securely.
          </p>

          {message ? (
            <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
              {message}
            </div>
          ) : null}

          <form action={signIn} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-white">Email</span>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-electric-blue/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Password</span>
              <input
                required
                minLength={8}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-electric-blue/60"
              />
            </label>
            <button
              type="submit"
              className="gold-cta group flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-black transition hover:scale-[1.01]"
            >
              Login to dashboard
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New to VP23?{" "}
            <Link href="/signup" className="font-semibold text-gold-bright">
              Create an account
            </Link>
          </p>
          <div className="mt-6 flex justify-center">
            <LanguageTabs compact />
          </div>
        </section>
      </div>
    </main>
  );
}
