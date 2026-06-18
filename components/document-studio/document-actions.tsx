"use client";

import { useState } from "react";
import {
  CalendarDays,
  HelpCircle,
  KeyRound,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { DocumentAction } from "@/lib/documents/config";

const actions: {
  id: DocumentAction;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "summarize",
    label: "Summarize",
    description: "Executive summary, themes, details, and next steps.",
    icon: Sparkles,
  },
  {
    id: "question",
    label: "Ask questions",
    description: "Ask ORIVOO about the document context.",
    icon: HelpCircle,
  },
  {
    id: "facts",
    label: "Extract key facts",
    description: "Names, dates, places, amounts, claims, and obligations.",
    icon: KeyRound,
  },
  {
    id: "timeline",
    label: "Generate timeline",
    description: "Chronological events and unresolved gaps.",
    icon: CalendarDays,
  },
];

type DocumentActionsProps = {
  documentId: string;
};

export function DocumentActions({ documentId }: DocumentActionsProps) {
  const [activeAction, setActiveAction] = useState<DocumentAction>("summarize");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function runAction(action: DocumentAction) {
    setActiveAction(action);
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/documents/${documentId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          question: action === "question" ? question : undefined,
        }),
      });
      const body = (await response.json()) as {
        result?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Document action failed.");
      }

      setResult(body.result ?? "No result returned.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Document action failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          ORIVOO Actions
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Analyze this document
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => void runAction(action.id)}
            disabled={isLoading}
            className={`rounded-2xl border p-4 text-left transition ${
              activeAction === action.id
                ? "border-gold/40 bg-gold/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <action.icon className="mb-4 size-5 text-gold" aria-hidden />
            <p className="font-semibold text-white">{action.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-white">
          Question for this document
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should ORIVOO answer from this document?"
            className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
          />
        </label>
        <button
          type="button"
          onClick={() => void runAction("question")}
          disabled={isLoading || !question.trim()}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold-bright transition hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && activeAction === "question" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <HelpCircle className="size-4" aria-hidden />
          )}
          Ask document
        </button>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            ORIVOO is analyzing the document...
          </div>
        ) : error ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-red-100">
            {error}
          </p>
        ) : result ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-white">
            {result}
          </p>
        ) : (
          <p className="text-sm leading-7 text-muted">
            Choose an action to summarize, ask questions, extract facts, or
            generate a timeline.
          </p>
        )}
      </div>
    </section>
  );
}
