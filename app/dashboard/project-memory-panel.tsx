"use client";

import { useState, type FormEvent } from "react";
import {
  deleteProjectMemory,
  saveProjectMemory,
} from "@/app/actions/assistant";
import type {
  ProjectMemory,
  ProjectMemoryType,
} from "@/lib/assistant/types";

const memoryTypes: Array<{
  value: ProjectMemoryType;
  label: string;
}> = [
  { value: "project_context", label: "Project Context" },
  { value: "requirements", label: "Requirements" },
  { value: "architecture", label: "Architecture" },
  { value: "preferences", label: "Preferences" },
  { value: "notes", label: "Notes" },
];

export function ProjectMemoryPanel({
  activeProjectId,
  memory,
  onMemoryChange,
}: {
  activeProjectId: string | null;
  memory: ProjectMemory[];
  onMemoryChange: (memory: ProjectMemory[]) => void;
}) {
  const [editingMemory, setEditingMemory] = useState<ProjectMemory | null>(null);
  const [memoryType, setMemoryType] =
    useState<ProjectMemoryType>("project_context");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setEditingMemory(null);
    setMemoryType("project_context");
    setTitle("");
    setContent("");
  }

  function startEditing(nextMemory: ProjectMemory) {
    setEditingMemory(nextMemory);
    setMemoryType(nextMemory.memory_type);
    setTitle(nextMemory.title);
    setContent(nextMemory.content);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProjectId || isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const result = await saveProjectMemory({
        projectId: activeProjectId,
        memoryId: editingMemory?.id,
        memoryType,
        title,
        content,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onMemoryChange(
        [
          result.memory,
          ...memory.filter((item) => item.id !== result.memory.id),
        ].sort(
          (first, second) =>
            new Date(second.updated_at).getTime() -
            new Date(first.updated_at).getTime(),
        ),
      );
      resetForm();
    } catch {
      setError("Could not save project memory.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(memoryId: string) {
    setError(null);

    const result = await deleteProjectMemory(memoryId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onMemoryChange(memory.filter((item) => item.id !== result.memoryId));

    if (editingMemory?.id === result.memoryId) {
      resetForm();
    }
  }

  return (
    <section className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Project Memory</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Persistent context for this project.
          </h2>
        </div>
        <p className="text-sm text-muted">
          {activeProjectId
            ? "Included in every AI request for this project."
            : "Select or create a project to add memory."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1fr]"
      >
        <div className="grid gap-3">
          <label className="sr-only" htmlFor="memory-type">
            Memory type
          </label>
          <select
            id="memory-type"
            value={memoryType}
            onChange={(event) =>
              setMemoryType(event.target.value as ProjectMemoryType)
            }
            disabled={!activeProjectId}
            className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {memoryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="memory-title">
            Memory title
          </label>
          <input
            id="memory-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Memory title"
            disabled={!activeProjectId}
            className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-gold/50 focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="grid gap-3">
          <label className="sr-only" htmlFor="memory-content">
            Memory content
          </label>
          <textarea
            id="memory-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add project facts, requirements, architecture, preferences, or notes..."
            rows={4}
            disabled={!activeProjectId}
            className="min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-gold/50 focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                !activeProjectId || !title.trim() || !content.trim() || isSaving
              }
              className="gold-gradient rounded-full px-4 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : editingMemory
                  ? "Save memory"
                  : "Add memory"}
            </button>
            {editingMemory ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:text-white"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {memory.length > 0 ? (
          memory.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-bright">
                    {formatMemoryType(item.memory_type)}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted transition hover:border-gold/40 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 transition hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">
                {item.content}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted md:col-span-2">
            {activeProjectId
              ? "No memory saved yet. Add facts like stack, requirements, architecture, preferences, or project notes."
              : "Project memory will appear here after you select a project."}
          </div>
        )}
      </div>
    </section>
  );
}

function formatMemoryType(memoryType: ProjectMemoryType) {
  return (
    memoryTypes.find((type) => type.value === memoryType)?.label ?? memoryType
  );
}
