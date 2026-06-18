import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { signIn } from "@/app/actions/auth";

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
          <Link href="/" className="flex items-center gap-3">
            <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black">
              <Sparkles className="size-5" aria-hidden />
            </div>
            <span className="font-semibold tracking-[0.2em] text-white">
              ORIVOO AI
            </span>
          </Link>
          <div className="mt-24">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              Return to your AI command center.
            </h1>
            <p className="mt-5 leading-7 text-muted">
              Pick up your research, documents, studios, and business workflows
              from the ORIVOO AI dashboard.
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mb-10 md:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <span className="font-semibold tracking-[0.2em] text-white">
                ORIVOO AI
              </span>
            </Link>
          </div>

          <h2 className="text-3xl font-semibold text-white">Login</h2>
          <p className="mt-3 text-sm text-muted">
            Access your ORIVOO AI workspace with Supabase authentication.
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
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Password</span>
              <input
                required
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60"
              />
            </label>
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:bg-gold-bright"
            >
              Login to dashboard
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New to ORIVOO AI?{" "}
            <Link href="/signup" className="font-semibold text-gold-bright">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
