"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, Printer, Send } from "lucide-react";

type InvoiceState = {
  customerName: string;
  customerEmail: string;
  jobDescription: string;
  amount: string;
  dueDate: string;
};

const initialState: InvoiceState = {
  customerName: "",
  customerEmail: "",
  jobDescription: "",
  amount: "",
  dueDate: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatAmount(amount: string) {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parsed);
}

export function InvoiceForm() {
  const [invoice, setInvoice] = useState(initialState);
  const [message, setMessage] = useState("");

  const errors = useMemo(() => {
    const nextErrors: string[] = [];

    if (invoice.customerName && invoice.customerName.trim().length < 2) {
      nextErrors.push("Customer name must be at least 2 characters.");
    }

    if (invoice.customerEmail && !emailPattern.test(invoice.customerEmail)) {
      nextErrors.push("Enter a valid customer email.");
    }

    if (invoice.jobDescription && invoice.jobDescription.trim().length < 3) {
      nextErrors.push("Job description must be at least 3 characters.");
    }

    if (invoice.amount && Number(invoice.amount) <= 0) {
      nextErrors.push("Amount must be greater than zero.");
    }

    return nextErrors;
  }, [invoice]);

  function updateField(field: keyof InvoiceState, value: string) {
    setInvoice((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity() || errors.length > 0) {
      setMessage("Fix the highlighted invoice fields before creating.");
      return;
    }

    setMessage("Invoice created in sandbox preview.");
  }

  function handleSendPlaceholder() {
    if (errors.length > 0 || !invoice.customerEmail) {
      setMessage("Create a valid invoice before sending.");
      return;
    }

    setMessage("Send invoice placeholder queued. Email delivery is a production TODO.");
  }

  function handleDownload() {
    window.print();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
      >
        <h2 className="text-2xl font-semibold text-white">Create invoice</h2>
        <p className="mt-2 text-sm text-muted">
          Required fields are validated before the sandbox preview is created.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-white">Customer name</span>
            <input
              required
              minLength={2}
              maxLength={120}
              value={invoice.customerName}
              onChange={(event) => updateField("customerName", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
              placeholder="Northstar Construction"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-white">Customer email</span>
            <input
              required
              type="email"
              value={invoice.customerEmail}
              onChange={(event) => updateField("customerEmail", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
              placeholder="ap@northstar.example"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-white">Job description</span>
            <textarea
              required
              minLength={3}
              maxLength={500}
              value={invoice.jobDescription}
              onChange={(event) =>
                updateField("jobDescription", event.target.value)
              }
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
              placeholder="Final milestone payment for commercial buildout"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-white">Amount</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={invoice.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
                placeholder="14900.00"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Due date</span>
              <input
                required
                type="date"
                value={invoice.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
              />
            </label>
          </div>

          {errors.length > 0 ? (
            <ul className="space-y-2 rounded-2xl border border-metal-red/30 bg-metal-red/10 p-4 text-sm text-metal-red-bright">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-electric-blue/30 bg-electric-blue/10 p-4 text-sm text-electric-blue-bright">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
          >
            Create invoice
          </button>
        </div>
      </form>

      <article className="metal-card rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">
              Invoice VP23-1043
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {invoice.customerName || "Customer name"}
            </h2>
            <p className="mt-1 break-all text-sm text-muted">
              {invoice.customerEmail || "customer@email.com"}
            </p>
          </div>
          <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
            Draft
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Job description
          </p>
          <p className="mt-3 min-h-20 leading-7 text-white">
            {invoice.jobDescription || "Describe the completed work."}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Amount
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatAmount(invoice.amount)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Due date
            </p>
            <p className="mt-3 text-xl font-semibold text-white">
              {invoice.dueDate || "Select date"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleSendPlaceholder}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-electric-blue/30 px-4 py-3 text-sm font-semibold text-electric-blue-bright transition hover:bg-electric-blue/10"
          >
            <Send className="size-4" aria-hidden />
            Send
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-gold/40"
          >
            <Download className="size-4" aria-hidden />
            Download
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-gold/40"
          >
            <Printer className="size-4" aria-hidden />
            Print
          </button>
        </div>
      </article>
    </div>
  );
}
