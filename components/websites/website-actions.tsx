"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  WEBSITE_ACTIONS,
  type WebsiteAction,
} from "@/lib/websites/config";

const icons: Record<WebsiteAction, typeof Sparkles> = {
  blog: FileText,
  copy: Sparkles,
  marketing: Megaphone,
  regenerate: RefreshCw,
  seo: Search,
  social: Share2,
};

type WebsiteActionsProps = {
  websiteId: string;
};

export function WebsiteActions({ websiteId }: WebsiteActionsProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<WebsiteAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: WebsiteAction) {
    setActiveAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/websites/${websiteId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Website action failed.");
      }

      setMessage(body.message ?? "Website action complete.");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Website action failed.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          AI Actions
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Build and improve
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(WEBSITE_ACTIONS) as WebsiteAction[]).map((action) => {
          const Icon = icons[action] ?? BarChart3;
          const isActive = activeAction === action;

          return (
            <button
              key={action}
              type="button"
              disabled={Boolean(activeAction)}
              onClick={() => void runAction(action)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-gold/35 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isActive ? (
                <Loader2 className="mb-4 size-5 animate-spin text-gold" />
              ) : (
                <Icon className="mb-4 size-5 text-gold" aria-hidden />
              )}
              <p className="text-sm font-semibold text-white">
                {WEBSITE_ACTIONS[action].label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
        {error ? (
          <p className="text-sm leading-7 text-red-100">{error}</p>
        ) : message ? (
          <p className="text-sm leading-7 text-gold-bright">{message}</p>
        ) : (
          <p className="text-sm leading-7 text-muted">
            Actions save generated improvements directly to this website.
          </p>
        )}
      </div>
    </section>
  );
}
