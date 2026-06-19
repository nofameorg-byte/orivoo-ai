"use client";

import type { AssistantStudioId } from "@/lib/assistant/studios";

const studioOptions: Array<{
  id: AssistantStudioId;
  label: string;
}> = [
  { id: "assistant", label: "Assistant" },
  { id: "legal", label: "Legal" },
  { id: "civic", label: "Civic" },
  { id: "research", label: "Research" },
  { id: "code", label: "Code" },
  { id: "website", label: "Website" },
  { id: "business", label: "Business" },
  { id: "design", label: "Design" },
  { id: "land", label: "Land" },
  { id: "science", label: "Science" },
];

export function AssistantStudioSelector({
  selectedStudio,
  onSelectedStudioChange,
}: {
  selectedStudio: AssistantStudioId;
  onSelectedStudioChange: (studioId: AssistantStudioId) => void;
}) {
  return (
    <div className="mt-3 rounded-[1.5rem] border border-white/10 bg-black/40 p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Studio</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Persistent workspace context
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {studioOptions.map((studio) => {
          const isSelected = studio.id === selectedStudio;

          return (
            <button
              key={studio.id}
              type="button"
              onClick={() => onSelectedStudioChange(studio.id)}
              className={`rounded-2xl border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black ${
                isSelected
                  ? "border-gold/50 bg-gold/10 text-gold-bright"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-gold/40 hover:bg-gold/10"
              }`}
              aria-pressed={isSelected}
            >
              {studio.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
