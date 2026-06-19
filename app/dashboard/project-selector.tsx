"use client";

import { useState, type FormEvent } from "react";
import { createAssistantProject } from "@/app/actions/assistant";
import type { AssistantStudioId } from "@/lib/assistant/studios";
import type { AssistantProject } from "@/lib/assistant/types";

export function ProjectSelector({
  activeProjectId,
  isLoading,
  onCreateProject,
  onSelectProject,
  projects,
  selectedStudio,
}: {
  activeProjectId: string | null;
  isLoading: boolean;
  onCreateProject: (project: AssistantProject) => void;
  onSelectProject: (project: AssistantProject) => void;
  projects: AssistantProject[];
  selectedStudio: AssistantStudioId;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || isCreating) {
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const result = await createAssistantProject({
        name,
        description,
        studio: selectedStudio,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setName("");
      setDescription("");
      onCreateProject(result.project);
    } catch {
      setError("Could not create the project.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-4 sm:p-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted">Project Workspace</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Continue a project or create a new workspace.
          </h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-gold-bright">Loading project...</p>
        ) : null}
      </div>

      <form
        onSubmit={handleCreateProject}
        className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"
      >
        <label className="sr-only" htmlFor="project-name">
          Project name
        </label>
        <input
          id="project-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
        />
        <label className="sr-only" htmlFor="project-description">
          Project description
        </label>
        <input
          id="project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional description"
          className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
        />
        <button
          type="submit"
          disabled={!name.trim() || isCreating}
          className="gold-gradient rounded-2xl px-5 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create project"}
        </button>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project)}
                disabled={isLoading}
                className={`rounded-3xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black ${
                  isActive
                    ? "border-gold/50 bg-gold/10"
                    : "border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/10"
                }`}
                aria-pressed={isActive}
              >
                <span className="block truncate text-base font-semibold text-white">
                  {project.name}
                </span>
                {project.description ? (
                  <span className="mt-2 line-clamp-2 block text-sm text-muted">
                    {project.description}
                  </span>
                ) : null}
                <span className="mt-3 inline-flex rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-bright">
                  {project.studio}
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted sm:col-span-2 xl:col-span-3">
            Create a project to keep studio work, conversations, and future files
            together.
          </div>
        )}
      </div>
    </section>
  );
}
