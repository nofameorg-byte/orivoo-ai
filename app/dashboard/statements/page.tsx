import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { statements } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Statements",
};

export default function StatementsPage() {
  function statementPlaceholder(period: string) {
    return Buffer.from(`VP23 statement placeholder ${period}`).toString(
      "base64",
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <FileText className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Statements
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Monthly statements and PDF placeholders.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Statement PDFs are placeholders until final partner-bank account and
          ledger exports are approved.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {statements.map((statement) => (
          <article key={statement.id} className="bank-card rounded-[2rem] p-6">
            <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
              {statement.status}
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-white">
              {statement.period}
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Generated</span>
                <span className="text-white">{statement.generated}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Credits</span>
                <span className="text-white">{statement.totalCredits}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Debits</span>
                <span className="text-white">{statement.totalDebits}</span>
              </div>
            </div>
            <a
              href={`data:application/pdf;base64,${statementPlaceholder(
                statement.period,
              )}`}
              download={`${statement.id}.pdf`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold/40"
            >
              <Download className="size-4" aria-hidden />
              Download PDF
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
