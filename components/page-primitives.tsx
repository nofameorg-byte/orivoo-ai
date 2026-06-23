import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

type PageHeroProps = {
  badge: string;
  title: string;
  body: string;
  primaryAction?: {
    href: string;
    label: string;
  };
};

type CardGridProps = {
  items: Array<{
    title: string;
    body?: string;
  }>;
};

type ChecklistProps = {
  items: string[];
};

export function PageHero({ badge, title, body, primaryAction }: PageHeroProps) {
  return (
    <section className="section-shell py-10 sm:py-14 lg:py-16">
      <div className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-12">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-gold-bright">
            <ShieldCheck className="size-4" aria-hidden />
            {badge}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            {body}
          </p>
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="vp23-primary-action mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition"
            >
              {primaryAction.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function CardGrid({ items }: CardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="rounded-3xl border border-border bg-panel p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold/50"
        >
          <CheckCircle2 className="mb-5 size-6 text-gold" aria-hidden />
          <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
          {item.body ? (
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function Checklist({ items }: ChecklistProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-2xl border border-border bg-panel-soft p-4 text-sm font-medium text-foreground"
        >
          <CheckCircle2 className="size-5 shrink-0 text-gold" aria-hidden />
          {item}
        </div>
      ))}
    </div>
  );
}
