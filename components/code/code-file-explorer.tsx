"use client";

import { useMemo, useState } from "react";
import { FileCode2, FolderTree, Search } from "lucide-react";
import { updateCodeFile } from "@/app/actions/code";

export type CodeFileRecord = {
  content: string;
  file_name: string;
  file_path: string;
  id: string;
};

type CodeFileExplorerProps = {
  codeProjectId: string;
  files: CodeFileRecord[];
};

export function CodeFileExplorer({ codeProjectId, files }: CodeFileExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(files[0]?.id ?? "");
  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return files.filter(
      (file) =>
        file.file_path.toLowerCase().includes(normalizedQuery) ||
        file.content.toLowerCase().includes(normalizedQuery),
    );
  }, [files, query]);
  const selectedFile =
    files.find((file) => file.id === selectedFileId) ?? filteredFiles[0] ?? files[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            File Viewer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Folder tree and editor
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-4 py-2">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files..."
            className="w-56 bg-transparent py-2 text-sm text-white outline-none placeholder:text-muted/70"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[18rem_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FolderTree className="size-4 text-gold" aria-hidden />
            Folder Structure
          </div>
          <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
            {filteredFiles.length ? (
              filteredFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                    selectedFile?.id === file.id
                      ? "border-gold/35 bg-gold/10 text-gold-bright"
                      : "border-white/10 bg-white/[0.03] text-muted hover:text-white"
                  }`}
                >
                  <FileCode2 className="mr-2 inline size-4" aria-hidden />
                  <span className="break-all">{file.file_path}</span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted">
                No files match your search.
              </div>
            )}
          </div>
        </aside>

        {selectedFile ? (
          <form
            action={updateCodeFile}
            className="rounded-3xl border border-white/10 bg-black/35 p-5"
          >
            <input type="hidden" name="codeProjectId" value={codeProjectId} />
            <input type="hidden" name="fileId" value={selectedFile.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-white">
                File Name
                <input
                  name="fileName"
                  defaultValue={selectedFile.file_name}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                />
              </label>
              <label className="text-sm font-medium text-white">
                File Path
                <input
                  name="filePath"
                  defaultValue={selectedFile.file_path}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-white">
              File Editor
              <textarea
                name="content"
                defaultValue={selectedFile.content}
                className="mt-2 min-h-[34rem] w-full resize-y rounded-2xl border border-white/10 bg-black/70 px-4 py-3 font-mono text-sm leading-6 text-white outline-none focus:border-gold/50"
              />
            </label>
            <button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-bright">
              Save file
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-muted">
            No files are available.
          </div>
        )}
      </div>
    </section>
  );
}
