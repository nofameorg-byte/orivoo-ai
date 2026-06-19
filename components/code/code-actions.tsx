"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bug,
  Database,
  FileText,
  Gauge,
  GitBranch,
  Loader2,
  Lock,
  Route,
  Sparkles,
} from "lucide-react";
import { CODE_ACTIONS, type CodeAction } from "@/lib/code/config";

const icons: Record<CodeAction, typeof Sparkles> = {
  "api-endpoints": Route,
  "database-schema": Database,
  documentation: FileText,
  explain: Sparkles,
  "fix-bugs": Bug,
  "performance-audit": Gauge,
  refactor: GitBranch,
  "security-audit": Lock,
};

type CodeActionsProps = {
  codeProjectId: string;
};

export function CodeActions({ codeProjectId }: CodeActionsProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<CodeAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: CodeAction) {
    setActiveAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/code/${codeProjectId}/actions`, {
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
        throw new Error(body.error ?? "Code action failed.");
      }

      setMessage(body.message ?? "Code action complete.");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Code action failed.",
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
          Analyze and improve
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(CODE_ACTIONS) as CodeAction[]).map((action) => {
          const Icon = icons[action];
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
                {CODE_ACTIONS[action].label}
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
            Analysis actions save notes or updated files back into this code
            project.
          </p>
        )}
      </div>
    </section>
  );
}
