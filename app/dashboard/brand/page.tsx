import type { Metadata } from "next";
import { FileText, Palette, Type } from "lucide-react";
import { VP23Logo } from "@/components/vp23-logo";

export const metadata: Metadata = {
  title: "Brand Guide",
};

const colors = [
  { name: "Black", hex: "#0B0B0B", className: "bg-[#0B0B0B]" },
  { name: "Red", hex: "#D90429", className: "bg-[#D90429]" },
  { name: "Electric Blue", hex: "#2563EB", className: "bg-[#2563EB]" },
  { name: "Gold", hex: "#D4AF37", className: "bg-[#D4AF37]" },
  { name: "Yellow", hex: "#FFD60A", className: "bg-[#FFD60A]" },
  { name: "White", hex: "#F8F9FA", className: "bg-[#F8F9FA]" },
];

export default function BrandGuidePage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <Palette className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            VP23 brand guide
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Official brand system for Versatile Partners 23, LLC.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Use the official logo asset directly from <code>public/vp23-logo.png</code>.
          Maintain aspect ratio, avoid redrawing the mark, and keep contrast high
          on dark financial interfaces.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="bank-card rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Official logo
          </p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/60 p-8">
            <VP23Logo href="/dashboard/brand" size="lg" showText={false} />
          </div>
        </article>

        <article className="bank-card rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Dark logo version
          </p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B0B0B] p-8">
            <VP23Logo href="/dashboard/brand" size="lg" showText={false} />
          </div>
        </article>

        <article className="bank-card rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Light logo version
          </p>
          <div className="mt-6 rounded-3xl border border-black/10 bg-[#F8F9FA] p-8">
            <VP23Logo href="/dashboard/brand" size="lg" showText={false} />
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center gap-3 text-gold">
          <Palette className="size-5" aria-hidden />
          <h2 className="text-xl font-semibold text-white">Color palette</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {colors.map((color) => (
            <article key={color.hex} className="rounded-3xl bg-black/45 p-4">
              <div
                className={`h-20 rounded-2xl border border-white/10 ${color.className}`}
              />
              <h3 className="mt-4 font-semibold text-white">{color.name}</h3>
              <p className="mt-1 font-mono text-sm text-muted">{color.hex}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3 text-electric-blue-bright">
            <Type className="size-5" aria-hidden />
            <h2 className="text-xl font-semibold text-white">Typography</h2>
          </div>
          <p className="text-xs uppercase tracking-[0.32em] text-gold">
            Interface label
          </p>
          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Premium fintech clarity
          </h3>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            VP23 uses a crisp sans-serif system with strong uppercase labels,
            compact metadata, and high-contrast headings for bank-partner-ready
            workflows.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="rounded-2xl bg-black/45 p-4">
              <span className="text-muted">Heading</span>
              <p className="mt-1 text-2xl font-semibold text-white">
                Geist / system sans, semibold
              </p>
            </div>
            <div className="rounded-2xl bg-black/45 p-4">
              <span className="text-muted">Body</span>
              <p className="mt-1 leading-6 text-white">
                Clear sentence case copy with muted supporting text.
              </p>
            </div>
          </div>
        </article>

        <article className="metal-card rounded-[2rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gold">
                Banking card preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                VP23 Business Account
              </h2>
            </div>
            <VP23Logo href="/dashboard/brand" size="sm" showText={false} />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Account
              </p>
              <p className="mt-2 font-mono text-xl text-white">**** 2389</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Routing
              </p>
              <p className="mt-2 font-mono text-xl text-white">121145349</p>
            </div>
          </div>
          <div className="mt-8 h-1 rounded-full bg-gradient-to-r from-metal-red via-gold to-electric-blue" />
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center gap-3 text-gold">
          <FileText className="size-5" aria-hidden />
          <h2 className="text-xl font-semibold text-white">
            Invoice branding preview
          </h2>
        </div>
        <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-black/55 p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start">
            <VP23Logo href="/dashboard/brand" size="md" />
            <div className="text-left sm:text-right">
              <p className="text-sm uppercase tracking-[0.24em] text-muted">
                Invoice
              </p>
              <p className="mt-1 font-mono text-xl text-white">VP23-1043</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">Bill from</p>
              <p className="mt-2 font-semibold text-white">
                Versatile Partners 23, LLC
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                106 Sparrow Circle
                <br />
                Blackville, SC 29817
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">Brand treatment</p>
              <p className="mt-2 text-sm leading-6 text-white">
                Dark header, official logo, gold labels, red and electric-blue
                accents, white invoice totals.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted">Total due</span>
              <span className="text-3xl font-semibold text-white">
                $14,900.00
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
