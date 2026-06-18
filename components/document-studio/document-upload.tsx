"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, UploadCloud } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
].join(",");

export function DocumentUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File | undefined) {
    if (!file || isUploading) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setError(null);
    setMessage(null);
    setIsUploading(true);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as {
        document?: { title?: string; status?: string };
        error?: string;
      };

      if (!response.ok && response.status !== 202) {
        throw new Error(body.error ?? "Could not upload document.");
      }

      if (body.error) {
        setError(body.error);
      } else {
        setMessage(`${body.document?.title ?? file.name} is ready.`);
      }

      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload document.",
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void uploadFile(event.dataTransfer.files[0]);
      }}
      className={`surface-card rounded-[2rem] p-6 transition ${
        isDragging ? "border-gold/50 bg-gold/10" : ""
      }`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <UploadCloud className="size-6" aria-hidden />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Upload to Document Studio
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted">
            Drop in PDFs, DOCX files, or images. ORIVOO stores them in Supabase
            Storage, extracts searchable chunks, and connects them to your
            authenticated account.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(event) => void uploadFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FileUp className="size-4" aria-hidden />
            )}
            {isUploading ? "Processing..." : "Choose file"}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/35 p-5 text-center text-sm text-muted">
        Drag and drop a file here. Supported: PDF, DOCX, JPEG, PNG, WEBP, GIF.
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
