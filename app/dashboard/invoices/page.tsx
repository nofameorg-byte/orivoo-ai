import type { Metadata } from "next";
import { FileText } from "lucide-react";
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

      <InvoiceForm />
    </div>
  );
}
