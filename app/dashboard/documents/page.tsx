import type { Metadata } from "next";
import { FileLock2 } from "lucide-react";
import { DocumentVault } from "./document-vault";

export const metadata: Metadata = {
  title: "Document Vault",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <FileLock2 className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Compliance document vault
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Upload and manage private KYB documents.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Upload private business documents for review and account-readiness
          workflows. Supported files: PDF, PNG, JPG, JPEG. Maximum file size:
          10MB.
        </p>
      </section>

      <DocumentVault />
    </div>
  );
}
