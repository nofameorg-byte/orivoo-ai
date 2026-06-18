"use client";

import { useState } from "react";
import { FolderPlus, Plus, X } from "lucide-react";
import { createProject } from "@/app/actions/projects";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
      >
        <Plus className="size-4" aria-hidden />
        Create project
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-lg rounded-[2rem] p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                  <FolderPlus className="size-6" aria-hidden />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Create project
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Projects organize chats, documents, and future studio assets
                  around one mission.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 p-2 text-muted transition hover:text-white"
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <form action={createProject} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Project name
                </span>
                <input
                  required
                  name="name"
                  placeholder="Launch ORIVOO AI"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-white">
                  Description
                </span>
                <textarea
                  name="description"
                  placeholder="What should this project coordinate?"
                  className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/70 focus:border-gold/50"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
              >
                Create and open project
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
