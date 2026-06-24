import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  Building2,
  CircleDollarSign,
  FileText,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Siren,
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
    price: "$0/mo",
    body: "For early businesses organizing customers, invoices, and documents.",
    features: ["Customer workspace", "Invoice records", "Document vault", "Basic ledger"],
    recommended: false,
  },
  {
    name: "Growth",
    price: "$29/mo",
    body: "For growing teams managing customers, invoices, applications, and payment records.",
    features: [
      "Unlimited invoices",
      "Unlimited customers",
      "Application tracking",
      "Payment records",
      "Ledger and statements",
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    body: "For partner-ready businesses needing compliance review, admin controls, and expanded workflows.",
    features: [
      "Growth features",
      "Admin controls",
      "Partner review package",
      "Compliance binder",
      "Expanded workflows",
    ],
    recommended: false,
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

          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
            <Link href="/" className="border-b border-gold pb-2 text-white">
              Home
            </Link>
            <a href="#features" className="pb-2 transition hover:text-gold-bright">
              Features
            </a>
            <a href="#pricing" className="pb-2 transition hover:text-gold-bright">
              Pricing
            </a>
            <a href="#business-banking" className="pb-2 transition hover:text-gold-bright">
              Business Banking
            </a>
            <a href="#payments" className="pb-2 transition hover:text-gold-bright">
              Payments
            </a>
            <a href="#invoices" className="pb-2 transition hover:text-gold-bright">
              Invoices
            </a>
            <a href="#security" className="pb-2 transition hover:text-gold-bright">
              Security
            </a>
            <a href="#contact" className="pb-2 transition hover:text-gold-bright">
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

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-7 px-6 pb-10 pt-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:pb-14 lg:pt-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-bright">
            <Siren className="size-4" aria-hidden />
            Business Command Center
          </div>
          <h1 className="max-w-[31rem] text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Move smarter.{" "}
            <span className="text-gold-bright">Get paid faster.</span> Run
            business with VP23.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
            VP23 helps businesses organize accounts, invoices, customers,
            documents, and payment readiness workflows. Business account
            activation is subject to partner-bank approval.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item}
                className="rounded-none border-l border-white/10 bg-transparent px-4 py-2 text-xs leading-5 text-muted"
              >
                <ShieldCheck className="mb-3 size-5 text-gold-bright" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[46rem] lg:-mt-28">
          <div className="absolute -left-10 top-8 h-56 w-56 rounded-full bg-metal-red/25 blur-3xl" />
          <div className="absolute inset-x-20 -bottom-8 h-36 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -right-10 top-8 h-56 w-56 rounded-full bg-electric-blue/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0a0a0a] shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#111111] px-4 py-3">
              <div className="flex items-center gap-2">
                <VP23Logo href="/" size="sm" showText={false} />
                <span className="text-xs font-medium text-muted">
                  VP23 Business Center
                </span>
              </div>
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-metal-red" />
                <span className="size-2.5 rounded-full bg-gold" />
                <span className="size-2.5 rounded-full bg-electric-blue" />
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gold/20 bg-[#111111] p-4">
                  <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
                    Total Balance
                  </p>
                  <p className="text-lg font-black text-gold-bright">Account pending</p>
                  <p className="mt-0.5 text-[0.58rem] text-muted">Partner approval required</p>
                </div>
                <div className="rounded-lg border border-electric-blue/20 bg-[#111111] p-4">
                  <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
                    Available
                  </p>
                  <p className="text-lg font-black text-electric-blue-bright">Awaiting activation</p>
                  <p className="mt-0.5 text-[0.58rem] text-muted">Compliance review required</p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#111111] p-4">
                <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
                  Recent Activity
                </p>
                {[
                  ["Business profile created", "Complete", "text-emerald-400"],
                  ["KYB documents requested", "Needed", "text-vp-yellow"],
                  ["Invoice workspace ready", "Ready", "text-emerald-400"],
                ].map(([label, amount, color]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-0"
                  >
                    <span className="text-[0.65rem] text-muted">{label}</span>
                    <span className={`text-[0.65rem] font-black ${color}`}>
                      {amount}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Invoice", "Customer", "Document"].map((action) => (
                  <div
                    key={action}
                    className="rounded-lg border border-white/10 bg-[#1a1a1a] p-3 text-center"
                  >
                    <p className="text-[0.58rem] font-semibold text-muted">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-6 lg:px-8"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-gold">
            Pricing
          </p>
          <h2 className="mt-3 text-4xl font-black text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-2 text-sm text-muted">
            Choose the plan that fits your operation.
          </p>
        </div>
        <div className="grid items-stretch gap-8 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative flex h-full min-h-[27rem] flex-col rounded-xl border bg-[#0a0a0a] p-6 ${
                tier.recommended
                  ? "border-gold/80 shadow-[0_0_28px_rgba(212,175,55,0.14)]"
                  : "border-gold/20 shadow-[0_0_20px_rgba(0,0,0,0.28)]"
              }`}
            >
              {tier.recommended ? (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-black/30 bg-gold px-5 py-1 text-[0.65rem] font-black uppercase tracking-wide text-black shadow-lg shadow-gold/20">
                  Recommended
                </div>
              ) : null}
              <h3 className="text-xl font-black text-white">{tier.name}</h3>
              <p className="mt-2 text-3xl font-black text-gold-bright">
                {tier.price}
              </p>
              <p className="mt-2 min-h-16 text-sm leading-6 text-muted">
                {tier.body}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="flex size-4 items-center justify-center rounded-full border border-gold/50 text-[0.55rem] text-gold">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 flex h-12 items-center justify-center rounded-lg px-4 text-sm font-black ${
                  tier.recommended
                    ? "gold-cta text-black"
                    : "border border-gold/20 text-white hover:border-gold/50 hover:bg-gold/10"
                }`}
              >
                {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Link>
            </article>
          ))}
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
