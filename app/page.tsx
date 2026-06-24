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
import { LanguageTabs } from "@/components/language-tabs";
import { VP23Logo } from "@/components/vp23-logo";

const valueProps = [
  "Customer records, invoices, and documents in one place",
  "Account-readiness workflows for growing businesses",
  "Built for contractors, owners, and operators",
];

const platformCards = [
  {
    title: "Operate",
    body: "Manage customers, invoices, applications, statements, and records from one business money workspace.",
    icon: Landmark,
  },
  {
    title: "Move",
    body: "Prepare payment workflows and approvals without enabling live banking rails.",
    icon: ArrowDownLeft,
  },
  {
    title: "Collect",
    body: "Create branded invoices, track customer history, and keep documents organized.",
    icon: FileText,
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    body: "Business workspace, invoices, customer records, and document organization.",
  },
  {
    name: "Business",
    price: "Custom",
    body: "Multi-business tools, ledger exports, application tracking, and customer workflows.",
  },
  {
    name: "Partner-ready",
    price: "Custom",
    body: "Statements, audit logs, review package tools, and partner-readiness controls.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 h-[46rem]" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-metal-red/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-72 w-72 rounded-full bg-electric-blue/25 blur-3xl" />

      <header className="relative z-10 mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="mb-3 flex justify-end">
          <LanguageTabs compact />
        </div>
        <div className="flex items-center justify-between">
          <VP23Logo size="md" />

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="transition hover:text-gold-bright">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-gold-bright">
              Pricing
            </a>
            <a href="#business-banking" className="transition hover:text-gold-bright">
              Business Banking
            </a>
            <a href="#payments" className="transition hover:text-gold-bright">
              Payments
            </a>
            <a href="#invoices" className="transition hover:text-gold-bright">
              Invoices
            </a>
            <a href="#security" className="transition hover:text-gold-bright">
              Security
            </a>
            <a href="#contact" className="transition hover:text-gold-bright">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-white sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="gold-cta rounded-full px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Start application
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-metal-red/40 bg-metal-red/10 px-4 py-2 text-sm text-metal-red-bright">
            <Siren className="size-4" aria-hidden />
            Business money operations for high-velocity operators
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Business-grade control.{" "}
            <span className="text-vp23-gradient">Built with VP23 energy.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            VP23 helps small businesses, contractors, and entrepreneurs organize
            customers, invoices, documents, applications, ledger records, and
            account-readiness workflows in one premium workspace.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="gold-cta group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Create VP23 account
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-gold/35 px-6 py-3 text-sm font-semibold text-gold-bright transition hover:border-gold hover:bg-gold/10"
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

        <div className="metal-card red-glow relative overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-metal-red-bright via-40% to-electric-blue-bright" />
          <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">VP23 splash screen</p>
                <h2 className="text-xl font-semibold text-white">
                  Business command center
                </h2>
              </div>
              <div className="rounded-full border border-electric-blue/35 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
                In development
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

      <section className="relative z-10 border-y border-gold/20 bg-[#080808]">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4 lg:px-8">
          {[
            ["1 Platform", "Unified workspace"],
            ["100% Secure", "Data protection"],
            ["Bilingual", "EN & ES support"],
            ["Built for Business", "For operators"],
          ].map(([stat, label]) => (
            <div key={stat}>
              <p className="text-2xl font-bold text-gold-bright md:text-3xl">
                {stat}
              </p>
              <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
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
              Business money tools with redline speed.
            </h2>
          </div>
          <p className="max-w-xl text-muted">
            Organize the work that keeps cash, customers, paperwork, and
            approvals moving without scattered spreadsheets.
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
            Business Banking Tools
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            VP23 prepares business account application workflows,
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
            Prepare payment records, customer histories, and approval workflows.
            Live payment rails are not enabled.
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
                Private workspace controls for business records.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Protected account access",
                "Private document workflows",
                "Review-ready business records",
                "Partner-readiness controls",
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

      <footer className="relative z-10 border-t border-gold/20 bg-gradient-to-br from-black via-panel to-black px-6 py-12 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <VP23Logo size="md" />
            <div className="mt-4">
              <LanguageTabs />
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Business money operations, customer records, invoices, documents,
              and account-readiness workflows with premium VP23 energy.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                Platform
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted">
                <a href="#features" className="block hover:text-white">Features</a>
                <a href="#pricing" className="block hover:text-white">Pricing</a>
                <a href="#invoices" className="block hover:text-white">Invoices</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                Business
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted">
                <a href="#business-banking" className="block hover:text-white">Business tools</a>
                <a href="#payments" className="block hover:text-white">Payments</a>
                <a href="#security" className="block hover:text-white">Security</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                Contact
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted">
                <a href="mailto:contact@vp-23.com" className="block hover:text-white">contact@vp-23.com</a>
                <a href="https://www.vp-23.com" className="block hover:text-white">www.vp-23.com</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-muted md:flex-row md:items-center md:justify-between">
          <p>
            VP23 is a financial technology platform. Banking services are not
            currently available and are subject to future approval by regulated
            banking partners.
          </p>
          <p>© VP23 — A product of Versatile Partners 23, LLC</p>
        </div>
      </footer>
    </main>
  );
}
