import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileText,
  ImageIcon,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { DocumentUpload } from "@/components/document-studio/document-upload";
import { createClient } from "@/lib/supabase/server";

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DocumentStudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access Document Studio.");
  }

  const { data: documents } = await supabase
    .from("documents")
    .select(
      "id,title,file_name,file_type,file_size,project_id,status,created_at,updated_at,extracted_text_preview,error_message",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id,name")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const projectNames = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
              <Sparkles className="size-4" aria-hidden />
              Document Studio
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Upload, read, and reason across your documents.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              Store PDFs, DOCX files, and images in Supabase Storage, then ask
              ORIVOO to summarize, extract facts, answer questions, and generate
              timelines.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Documents
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {documents?.length ?? 0}
            </p>
          </div>
        </div>
      </section>

      <DocumentUpload projects={projects ?? []} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Library
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Document list
            </h2>
          </div>
          <UploadCloud className="size-6 text-gold" aria-hidden />
        </div>

        {documents?.length ? (
          <div className="grid gap-4">
            {documents.map((document) => {
              const Icon = document.file_type === "image" ? ImageIcon : FileText;

              return (
                <Link
                  key={document.id}
                  href={`/dashboard/document-studio/${document.id}`}
                  className="group rounded-3xl border border-white/10 bg-black/35 p-5 transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/10"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-white">
                          {document.title}
                        </h3>
                        <p className="mt-1 truncate text-sm text-muted">
                          {document.file_name} · {formatBytes(document.file_size)}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold">
                          {document.project_id
                            ? projectNames.get(document.project_id) ??
                              "Project"
                            : "No project"}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                          {document.extracted_text_preview ??
                            document.error_message ??
                            "No preview available yet."}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          document.status === "ready"
                            ? "border-gold/30 bg-gold/10 text-gold-bright"
                            : document.status === "failed"
                              ? "border-red-400/25 bg-red-500/10 text-red-100"
                              : "border-white/10 bg-white/[0.03] text-muted"
                        }`}
                      >
                        {document.status}
                      </span>
                      <span className="hidden text-sm text-muted sm:inline">
                        {formatDate(document.updated_at)}
                      </span>
                      <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <FileText className="mx-auto mb-4 size-10 text-gold" aria-hidden />
            <h3 className="text-xl font-semibold text-white">
              No documents yet
            </h3>
            <p className="mt-3 text-muted">
              Upload your first PDF, DOCX, or image to start analyzing it with
              ORIVOO Document Studio.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
