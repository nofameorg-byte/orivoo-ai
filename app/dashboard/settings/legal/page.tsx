import type { Metadata } from "next";
import { Building2, FileText, Mail, MapPin } from "lucide-react";
import { AccountControls } from "./account-controls";

export const metadata: Metadata = {
  title: "Legal Settings",
};

type LegalSettingsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

const policies = [
  {
    title: "Privacy Policy",
    body: "How VP23 collects, uses, protects, and retains account, KYB, support, and compliance information.",
  },
  {
    title: "Terms & Conditions",
    body: "The terms governing access to VP23, account application workflows, document uploads, and user responsibilities.",
  },
  {
    title: "Cookie Policy",
    body: "How VP23 may use essential cookies and similar technologies for authentication, security, and application performance.",
  },
  {
    title: "Acceptable Use Policy",
    body: "Prohibited activities, restricted business categories, fraud prevention, and compliance expectations for users.",
  },
];

export default async function LegalSettingsPage({
  searchParams,
}: LegalSettingsPageProps) {
  const { message } = await searchParams;

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Legal settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Policies, company information, and account controls.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Review VP23 legal policies, contact details, and account management
          controls.
        </p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {policies.map((policy) => (
          <article
            key={policy.title}
            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <FileText className="mb-6 size-6 text-gold" aria-hidden />
            <h2 className="text-xl font-semibold text-white">{policy.title}</h2>
            <p className="mt-3 leading-7 text-muted">{policy.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3 text-electric-blue-bright">
            <Building2 className="size-5" aria-hidden />
            <h2 className="text-xl font-semibold text-white">
              Company Information
            </h2>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-6">
            <p className="font-semibold text-white">
              Versatile Partners 23, LLC
            </p>
            <p className="flex gap-3 text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span>
                106 Sparrow Circle
                <br />
                Blackville, SC 29817
              </span>
            </p>
            <p className="flex gap-3 text-muted">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <a href="mailto:contact@vp-23.com" className="hover:text-white">
                contact@vp-23.com
              </a>
            </p>
            <p className="text-muted">
              <a
                href="http://www.vp-23.com"
                className="font-semibold text-electric-blue-bright"
              >
                www.vp-23.com
              </a>
            </p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">
            Contact Information
          </h2>
          <p className="mt-3 leading-7 text-muted">
            For privacy, terms, support, compliance document requests, or
            business registration questions, contact VP23 at{" "}
            <a
              href="mailto:contact@vp-23.com"
              className="font-semibold text-gold-bright"
            >
              contact@vp-23.com
            </a>
            .
          </p>
        </article>
      </section>

      <AccountControls />
    </div>
  );
}
