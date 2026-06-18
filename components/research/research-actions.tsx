"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  FileSearch,
  Landmark,
  Loader2,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import {
  RESEARCH_ACTIONS,
  type ResearchAction,
} from "@/lib/research/config";

const actionIcons: Record<ResearchAction, typeof Sparkles> = {
  "business-opportunity": Building2,
  competitor: Target,
  "executive-summary": Sparkles,
  government: Landmark,
  grant: FileSearch,
  market: BarChart3,
  "strategic-recommendations": Sparkles,
  swot: ShieldAlert,
};

type ResearchActionsProps = {
  initialContent: string;
  reportId: string;
  onContentChange: (content: string) => void;
};

export function ResearchActions({
  initialContent,
  onContentChange,
  reportId,
}: ResearchActionsProps) {
  const [content, setContent] = useState(initialContent);
  const [activeAction, setActiveAction] = useState<ResearchAction | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: ResearchAction) {
    setActiveAction(action);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/research/${reportId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const body = (await response.json()) as {
        error?: string;
        report_content?: string;
        result?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Research action failed.");
      }

      setResult(body.result ?? "Action complete.");

      if (body.report_content) {
        setContent(body.report_content);
        onContentChange(body.report_content);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Research action failed.",
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
          Expand this report
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(RESEARCH_ACTIONS) as ResearchAction[]).map((action) => {
          const Icon = actionIcons[action];
          const isActive = activeAction === action;

          return (
            <button
              key={action}
              type="button"
              onClick={() => void runAction(action)}
              disabled={Boolean(activeAction)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-gold/35 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isActive ? (
                <Loader2 className="mb-4 size-5 animate-spin text-gold" />
              ) : (
                <Icon className="mb-4 size-5 text-gold" aria-hidden />
              )}
              <p className="text-sm font-semibold text-white">
                {RESEARCH_ACTIONS[action].label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
        {error ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-red-100">
            {error}
          </p>
        ) : result ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-white">
            {result}
          </p>
        ) : (
          <p className="text-sm leading-7 text-muted">
            Generated sections are saved automatically to this report. Current
            report length: {content.length.toLocaleString()} characters.
          </p>
        )}
      </div>
    </section>
  );
}
