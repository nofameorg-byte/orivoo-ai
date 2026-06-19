"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  Loader2,
} from "lucide-react";
import { ACADEMY_ACTIONS, type AcademyAction } from "@/lib/academy/config";

const icons: Record<AcademyAction, typeof BookOpen> = {
  flashcards: Layers3,
  homework: Home,
  lesson: BookOpen,
  "parent-summary": FileText,
  quiz: ClipboardList,
  "study-guide": Brain,
  "teacher-guide": GraduationCap,
};

export function AcademyActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<AcademyAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: AcademyAction) {
    setActiveAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/academy/${courseId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Academy action failed.");
      }

      setMessage(body.message ?? "Academy action complete.");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Academy action failed.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
        AI Actions
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        Expand learning materials
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(Object.keys(ACADEMY_ACTIONS) as AcademyAction[]).map((action) => {
          const Icon = icons[action];
          const isActive = activeAction === action;

          return (
            <button
              key={action}
              type="button"
              disabled={Boolean(activeAction)}
              onClick={() => void runAction(action)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-gold/35 hover:bg-gold/10 disabled:opacity-60"
            >
              {isActive ? (
                <Loader2 className="mb-4 size-5 animate-spin text-gold" />
              ) : (
                <Icon className="mb-4 size-5 text-gold" aria-hidden />
              )}
              <p className="text-sm font-semibold text-white">
                {ACADEMY_ACTIONS[action].label}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
        {error ? (
          <p className="text-sm text-red-100">{error}</p>
        ) : message ? (
          <p className="text-sm text-gold-bright">{message}</p>
        ) : (
          <p className="text-sm leading-7 text-muted">
            Generated education materials are saved to this course.
          </p>
        )}
      </div>
    </section>
  );
}
