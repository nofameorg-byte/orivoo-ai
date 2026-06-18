import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Braces,
  Building2,
  Compass,
  FileText,
  FlaskConical,
  Globe2,
  Landmark,
  Layers3,
  Leaf,
  Palette,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";

const studios = [
  { name: "Assistant", icon: Bot },
  { name: "Document Studio", icon: FileText },
  { name: "Research Studio", icon: Search },
  { name: "Website Builder", icon: Globe2 },
  { name: "Code Studio", icon: Braces },
  { name: "Business Builder", icon: Building2 },
  { name: "Design Studio", icon: Palette },
  { name: "Land Studio", icon: Trees },
  { name: "Concept Studio", icon: Layers3 },
  { name: "Legal Studio", icon: Scale },
  { name: "Civic Studio", icon: Landmark },
  { name: "Botanical Studio", icon: Leaf },
  { name: "Genealogy Studio", icon: Users },
  { name: "Science Studio", icon: FlaskConical },
];

const valueProps = [
  "Unified AI workspace for specialized creation",
  "Secure Supabase-backed identity and data",
  "Designed for fast Vercel deployment",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 h-[46rem]" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="gold-gradient flex size-10 items-center justify-center rounded-2xl text-black shadow-lg shadow-gold/20">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <span className="text-lg font-semibold tracking-[0.2em] text-white">
            ORIVOO AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#studios" className="transition hover:text-white">
            Studios
          </a>
          <a href="#platform" className="transition hover:text-white">
            Platform
          </a>
          <a href="#security" className="transition hover:text-white">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-muted transition hover:text-white sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-gold/40 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-bright"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <Sparkles className="size-4" aria-hidden />
            A premium AI command center for ambitious teams
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build, research, design, and launch from one{" "}
            <span className="text-gold-gradient">AI studio suite.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            ORIVOO AI brings a ChatGPT-inspired assistant, Claude-like clarity,
            and Cursor-style creative velocity into a focused SaaS workspace for
            modern operators.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
            >
              Create your workspace
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-gold/50 hover:bg-white/5"
            >
              Open dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted"
              >
                <ShieldCheck className="mb-3 size-5 text-gold" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card relative overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">ORIVOO Assistant</p>
                <h2 className="text-xl font-semibold text-white">
                  Mission Control
                </h2>
              </div>
              <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                Live
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-panel-soft p-4">
                <p className="text-sm text-muted">User</p>
                <p className="mt-1 text-white">
                  Turn this concept into a launch plan, landing page, and
                  investor-ready summary.
                </p>
              </div>
              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4">
                <p className="text-sm text-gold-bright">ORIVOO AI</p>
                <p className="mt-1 text-white">
                  I routed your request through Concept, Document, Business,
                  Design, and Website studios. Here is the first execution map.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {studios.slice(0, 6).map((studio) => (
                <div
                  key={studio.name}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <studio.icon className="mb-3 size-5 text-gold" aria-hidden />
                  <p className="text-sm font-medium text-white">{studio.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="studios"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Studio suite
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
              Every workspace starts with the right specialist.
            </h2>
          </div>
          <p className="max-w-xl text-muted">
            Choose a studio, keep context across workflows, and move from idea
            to artifact without leaving the ORIVOO AI dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {studios.map((studio) => (
            <div
              key={studio.name}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
            >
              <studio.icon
                className="mb-5 size-6 text-gold transition group-hover:text-gold-bright"
                aria-hidden
              />
              <h3 className="font-semibold text-white">{studio.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Create, analyze, and refine with domain-aware AI workflows.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="platform"
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3 lg:px-8"
      >
        {[
          {
            title: "Focused interface",
            body: "A low-noise black canvas with crisp white hierarchy and gold moments for high-value actions.",
          },
          {
            title: "Production foundation",
            body: "Next.js 16 App Router, strict TypeScript, Tailwind CSS, Supabase auth, and Vercel-friendly defaults.",
          },
          {
            title: "Operator velocity",
            body: "Start with chat, move into specialized studios, and maintain a single command center for decisions.",
          },
        ].map((item) => (
          <div key={item.title} className="surface-card rounded-3xl p-8">
            <Compass className="mb-8 size-7 text-gold" aria-hidden />
            <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-4 leading-7 text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section
        id="security"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-8"
      >
        <div className="surface-card overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Secure by design
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
                Supabase authentication and database-ready architecture.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Email and password auth flows",
                "Protected dashboard routes",
                "RLS-ready database migration",
                "Environment template for Vercel",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-muted"
                >
                  <ShieldCheck className="mb-3 size-5 text-gold" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
