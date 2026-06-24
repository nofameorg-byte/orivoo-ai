import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  Building2,
  CircleDollarSign,
  FileText,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Siren,
  TrendingUp,
  Users,
} from "lucide-react";
import { VP23Logo } from "@/components/vp23-logo";

const valueProps = [
  "Banking integration settings stay server-side",
  "Supabase Auth and RLS-ready database foundation",
  "Mobile-first financial command center",
];

const platformCards = [
  {
    title: "Operate",
    body: "Monitor balances, accounts, transactions, customers, and invoices from one protected cockpit.",
    icon: Landmark,
  },
  {
    title: "Move",
    body: "Prepare payment workflows through a secure backend layer built for partner-bank approval.",
    icon: ArrowDownLeft,
  },
  {
    title: "Collect",
    body: "Create invoices, capture customer details, and print or download invoice records for MVP workflows.",
    icon: FileText,
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    body: "Application workspace, KYB checklist, invoices, and customer records.",
  },
  {
    name: "Business",
    price: "Custom",
    body: "Multi-business management, document workflows, ledger exports, and review queues.",
  },
  {
    name: "Partner-ready",
    price: "Custom",
    body: "Adapter preparation, audit logs, statements, and sponsor-bank readiness controls.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 h-[46rem]" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-metal-red/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-72 w-72 rounded-full bg-electric-blue/25 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <VP23Logo size="md" />

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="#business-banking" className="transition hover:text-white">
            Business Banking
          </a>
          <a href="#payments" className="transition hover:text-white">
            Payments
          </a>
          <a href="#invoices" className="transition hover:text-white">
            Invoices
          </a>
          <a href="#security" className="transition hover:text-white">
            Security
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contact
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
            className="rounded-full border border-gold/50 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-metal-red/20 transition hover:bg-gold-bright"
          >
            Start application
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-metal-red/40 bg-metal-red/10 px-4 py-2 text-sm text-metal-red-bright">
            <Siren className="size-4" aria-hidden />
            Premium fintech operations for high-velocity businesses
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Operate with bank-grade discipline.{" "}
            <span className="text-vp23-gradient">Control like VP23.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            VP23 is a premium fintech platform with Supabase-secured identity,
            protected dashboard routes, invoices, customers, transactions,
            transfers, and server-only banking integration prep.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-metal-red/20 transition hover:bg-gold-bright"
            >
              Create VP23 account
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-electric-blue/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-electric-blue-bright hover:bg-electric-blue/10"
            >
              Open dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-muted"
              >
                <ShieldCheck className="mb-3 size-5 text-gold-bright" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="metal-card relative overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-metal-red-bright via-40% to-electric-blue-bright" />
          <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">VP23 splash screen</p>
                <h2 className="text-xl font-semibold text-white">
                  Financial command deck
                </h2>
              </div>
              <div className="rounded-full border border-electric-blue/35 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
                Partner review
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-metal-red/20 via-black to-electric-blue/20 p-6">
              <VP23Logo
                href="/"
                size="lg"
                showText={false}
                className="justify-center"
              />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["Available", "$128,430.18"],
                  ["Routing", "121145349"],
                  ["Invoices", "$23,350"],
                  ["Transfers", "Prepared"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/55 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">
                      {label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { name: "Accounts", icon: Landmark },
                { name: "Transactions", icon: ReceiptText },
                { name: "Transfers", icon: TrendingUp },
                { name: "Customers", icon: Users },
              ].map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <item.icon className="mb-3 size-5 text-gold" aria-hidden />
                  <p className="text-sm font-medium text-white">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-bright">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
              Banking workflows with an aggressive premium edge.
            </h2>
          </div>
          <p className="max-w-xl text-muted">
            Built mobile-first with protected App Router pages for business
            profiles, accounts, transactions, transfers, customers, invoices,
            and settings.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {platformCards.map((card) => (
            <div
              key={card.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
            >
              <card.icon
                className="mb-6 size-7 text-gold transition group-hover:text-gold-bright"
                aria-hidden
              />
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 leading-7 text-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3 lg:px-8"
      >
        {pricingTiers.map((tier) => (
          <article key={tier.name} className="bank-card rounded-[2rem] p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gold">
              {tier.name}
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              {tier.price}
            </h2>
            <p className="mt-4 leading-7 text-muted">{tier.body}</p>
          </article>
        ))}
      </section>

      <section
        id="business-banking"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="surface-card rounded-[2rem] p-8 md:p-12">
          <Building2 className="mb-6 size-8 text-gold" aria-hidden />
          <h2 className="text-3xl font-semibold text-white md:text-5xl">
            Business Banking
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            VP23 prepares checking and savings application workflows,
            multi-business access, document review, and account-readiness tools
            while partner approval remains pending.
          </p>
        </div>
      </section>

      <section
        id="payments"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="surface-card rounded-[2rem] p-8 md:p-12">
          <ArrowDownLeft className="mb-6 size-8 text-electric-blue-bright" aria-hidden />
          <h2 className="text-3xl font-semibold text-white md:text-5xl">
            Payments
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            Prepare ACH, wire, and real-time payment records behind server-side
            abstractions. No live payment rails are enabled.
          </p>
        </div>
      </section>

      <section
        id="invoices"
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3 lg:px-8"
      >
        {[
          {
            title: "Create invoice",
            body: "Collect customer name, email, job description, amount, and due date with validation.",
          },
          {
            title: "Send placeholder",
            body: "Placeholder action reserves room for email delivery after compliance and vendor setup.",
          },
          {
            title: "Download or print",
            body: "Invoice previews can be printed or saved by the browser for MVP billing records.",
          },
        ].map((item) => (
          <div key={item.title} className="surface-card rounded-3xl p-8">
            <CircleDollarSign className="mb-8 size-7 text-gold" aria-hidden />
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
                Supabase auth, RLS, and server-only Column integration.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Email/password auth flows",
                "Protected dashboard routes",
                "RLS-enabled financial records",
                "COLUMN_API_KEY never reaches client components",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-muted"
                >
                  <LockKeyhole
                    className="mb-3 size-5 text-electric-blue-bright"
                    aria-hidden
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-8"
      >
        <div className="surface-card rounded-[2rem] p-8 md:p-12">
          <h2 className="text-3xl font-semibold text-white md:text-5xl">
            Contact VP23
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            Email contact@vp-23.com or visit www.vp-23.com for business
            registration, support, and partner-readiness inquiries.
          </p>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-white/10 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <VP23Logo size="sm" />
        <p className="max-w-3xl text-xs leading-5">
          VP23 is a financial technology platform. Banking services are not
          currently available. Features shown may be under development and
          subject to future partner bank approval.
        </p>
      </footer>
    </main>
  );
}
