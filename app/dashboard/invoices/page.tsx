import type { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";
import { invoiceCapabilities } from "@/lib/vp23/data";
import { InvoiceForm } from "./invoice-form";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <FileText className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Invoice studio
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Create, send, download, and print invoices.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Send is a placeholder for the MVP. TODO: Add production email
          delivery, payment links, tax treatment, audit trails, and compliance
          review before live collections.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {invoiceCapabilities.map((capability) => (
          <article key={capability} className="bank-card rounded-3xl p-5">
            <ShieldCheck className="mb-4 size-5 text-electric-blue-bright" aria-hidden />
            <p className="text-sm leading-6 text-muted">{capability}</p>
          </article>
        ))}
      </section>

      <InvoiceForm />
    </div>
  );
}
