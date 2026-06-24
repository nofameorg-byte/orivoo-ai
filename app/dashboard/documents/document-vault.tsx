"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, Eye, FileUp, RefreshCw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type BusinessDocument =
  Database["public"]["Tables"]["business_documents"]["Row"];
type DocumentCategory = BusinessDocument["category"];
type AllowedMimeType = BusinessDocument["mime_type"];

const bucketName = "business-documents";
const maxFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set<AllowedMimeType>([
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
]);

const categories: DocumentCategory[] = [
  "EIN letter",
  "Articles of Organization",
  "Operating Agreement",
  "Beneficial Owner ID",
  "Proof of Address",
  "Bank Statement",
  "Business License",
  "Other",
];

function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return allowedMimeTypes.has(mimeType as AllowedMimeType);
}

export function DocumentVault() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState("");
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [message, setMessage] = useState("");
  const [loadingCategory, setLoadingCategory] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Sign in required to manage documents.");
        return;
      }

      setUserId(user.id);
      const { data, error } = await supabase
        .from("business_documents")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setDocuments(data ?? []);
    }

    void loadDocuments();
  }, [supabase]);

  async function refreshDocuments() {
    const { data, error } = await supabase
      .from("business_documents")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDocuments(data ?? []);
  }

  async function handleUpload(
    category: DocumentCategory,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !userId) {
      return;
    }

    if (!isAllowedMimeType(file.type)) {
      setMessage("Only PDF, PNG, JPG, and JPEG files are supported.");
      return;
    }

    const mimeType = file.type;

    if (file.size > maxFileSize) {
      setMessage("Files must be 10MB or smaller.");
      return;
    }

    setLoadingCategory(category);
    setMessage("");

    const storagePath = `${userId}/${category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}/${Date.now()}-${normalizeFileName(
      file.name,
    )}`;

    const upload = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: mimeType,
      });

    if (upload.error) {
      setLoadingCategory("");
      setMessage(upload.error.message);
      return;
    }

    const existing = documents.find((document) => document.category === category);

    if (existing) {
      await supabase.storage.from(bucketName).remove([existing.storage_path]);
      const { error } = await supabase
        .from("business_documents")
        .update({
          file_name: file.name,
          file_size: file.size,
          mime_type: mimeType,
          storage_path: storagePath,
          verification_status: "unverified",
        })
        .eq("id", existing.id);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(`${category} replaced.`);
      }
    } else {
      const { error } = await supabase.from("business_documents").insert({
        category,
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
        owner_id: userId,
        storage_path: storagePath,
        verification_status: "unverified",
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(`${category} uploaded.`);
      }
    }

    setLoadingCategory("");
    await refreshDocuments();
  }

  async function viewDocument(document: BusinessDocument) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(document.storage_path, 60);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function downloadDocument(document: BusinessDocument) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(document.storage_path);

    if (error) {
      setMessage(error.message);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.file_name;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteDocument(document: BusinessDocument) {
    const storage = await supabase.storage
      .from(bucketName)
      .remove([document.storage_path]);

    if (storage.error) {
      setMessage(storage.error.message);
      return;
    }

    const { error } = await supabase
      .from("business_documents")
      .delete()
      .eq("id", document.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`${document.category} deleted.`);
    await refreshDocuments();
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {categories.map((category) => {
          const document = documents.find((item) => item.category === category);

          return (
            <article
              key={category}
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {category}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {document
                      ? `${document.file_name} · ${Math.ceil(
                          document.file_size / 1024,
                        )} KB`
                      : "No document uploaded"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-muted">
                  {document?.verification_status ?? "missing"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/25 px-4 py-2 text-sm font-semibold text-gold-bright transition hover:bg-gold/10">
                  {document ? (
                    <RefreshCw className="size-4" aria-hidden />
                  ) : (
                    <FileUp className="size-4" aria-hidden />
                  )}
                  {loadingCategory === category
                    ? "Uploading..."
                    : document
                      ? "Replace"
                      : "Upload"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpg,image/jpeg"
                    className="sr-only"
                    disabled={loadingCategory === category}
                    onChange={(event) => void handleUpload(category, event)}
                  />
                </label>
                {document ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void viewDocument(document)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-electric-blue/40"
                    >
                      <Eye className="size-4" aria-hidden />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadDocument(document)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-electric-blue/40"
                    >
                      <Download className="size-4" aria-hidden />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteDocument(document)}
                      className="inline-flex items-center gap-2 rounded-full border border-metal-red/25 px-4 py-2 text-sm font-semibold text-metal-red-bright transition hover:bg-metal-red/10"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
