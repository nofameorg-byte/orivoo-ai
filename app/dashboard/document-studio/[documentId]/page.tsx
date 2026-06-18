/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { DocumentActions } from "@/components/document-studio/document-actions";
import { createClient } from "@/lib/supabase/server";

type DocumentViewerPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DocumentViewerPage({
  params,
}: DocumentViewerPageProps) {
  const { documentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to view this document.");
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select(
      "id,title,file_name,file_type,mime_type,file_size,status,created_at,updated_at,extracted_text_preview,error_message",
    )
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (documentError || !document) {
    notFound();
  }

  const { data: chunks } = await supabase
    .from("document_chunks")
    .select("id,chunk_index,content")
    .eq("document_id", document.id)
    .eq("user_id", user.id)
    .order("chunk_index", { ascending: true })
    .limit(8);

  const fileUrl = `/api/documents/${document.id}/file`;
  const FileIcon = document.file_type === "image" ? ImageIcon : FileText;

  return (
    <div id="workspace" className="space-y-6">
      <Link
        href="/dashboard/document-studio"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Document Studio
      </Link>

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <FileIcon className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Document Studio
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
                {document.title}
              </h1>
              <p className="mt-3 text-sm text-muted">
                {document.file_name} · {formatBytes(document.file_size)} ·{" "}
                {document.mime_type}
              </p>
            </div>
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
          >
            <Download className="size-4" aria-hidden />
            Open file
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Status", value: document.status },
            { label: "Uploaded", value: formatDate(document.created_at) },
            { label: "Chunks", value: String(chunks?.length ?? 0) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Viewer
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Source document
              </h2>
            </div>
            <ShieldCheck className="size-6 text-gold" aria-hidden />
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/60">
            {document.file_type === "image" ? (
              <img
                src={fileUrl}
                alt={document.title}
                className="max-h-[34rem] w-full object-contain"
              />
            ) : document.file_type === "pdf" ? (
              <iframe
                src={fileUrl}
                title={document.title}
                className="h-[34rem] w-full"
              />
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center p-10 text-center">
                <FileText className="mb-5 size-12 text-gold" aria-hidden />
                <h3 className="text-xl font-semibold text-white">
                  DOCX preview
                </h3>
                <p className="mt-3 max-w-md text-muted">
                  Browser previews for DOCX files are limited. Open the file to
                  download it, or use the extracted chunks and ORIVOO actions.
                </p>
              </div>
            )}
          </div>
        </section>

        <DocumentActions documentId={document.id} />
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <Layers3 className="size-6 text-gold" aria-hidden />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Chunks
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Extracted document context
            </h2>
          </div>
        </div>

        {document.error_message ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            {document.error_message}
          </div>
        ) : chunks?.length ? (
          <div className="grid gap-3">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gold">
                  Chunk {chunk.chunk_index + 1}
                </p>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-muted">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted">
            No extracted chunks are available yet.
          </div>
        )}
      </section>
    </div>
  );
}
