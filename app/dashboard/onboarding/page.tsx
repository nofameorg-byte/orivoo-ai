import type { Metadata } from "next";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { onboardingSteps } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          User onboarding
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          From sign-up to bank-ready business.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          The next operational milestone is not more styling: it is onboarding,
          KYB/KYC verification, clean Column entity mapping, and a sponsor-bank
          program path.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="space-y-4">
          {onboardingSteps.map((step, index) => {
            const ready = step.status === "Ready";

            return (
              <article
                key={step.title}
                className="grid gap-4 rounded-3xl border border-white/10 bg-black/45 p-5 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  {ready ? (
                    <CheckCircle2 className="size-5 text-electric-blue-bright" aria-hidden />
                  ) : (
                    <CircleDashed className="size-5 text-gold" aria-hidden />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {step.title}
                  </h2>
                  <p className="mt-2 leading-6 text-muted">{step.body}</p>
                </div>
                <span className="w-fit rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                  {step.status}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
