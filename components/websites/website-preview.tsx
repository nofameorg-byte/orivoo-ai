"use client";

import { useMemo, useState } from "react";
import { pageToHtml, type GeneratedWebsitePage } from "@/lib/websites/generation";

type WebsitePreviewProps = {
  pages: GeneratedWebsitePage[];
  websiteTitle: string;
};

export function WebsitePreview({ pages, websiteTitle }: WebsitePreviewProps) {
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.page_slug ?? "");
  const selectedPage =
    pages.find((page) => page.page_slug === selectedSlug) ?? pages[0] ?? null;
  const html = useMemo(
    () => (selectedPage ? pageToHtml(selectedPage, websiteTitle) : ""),
    [selectedPage, websiteTitle],
  );

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Preview Mode
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Website preview
          </h2>
        </div>
        <select
          value={selectedSlug}
          onChange={(event) => setSelectedSlug(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50"
        >
          {pages.map((page) => (
            <option key={page.page_slug} value={page.page_slug}>
              {page.page_name}
            </option>
          ))}
        </select>
      </div>

      {selectedPage ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
          <div className="flex items-center gap-2 border-b border-white/10 bg-panel-soft px-4 py-3">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-400" />
            <span className="size-3 rounded-full bg-green-400" />
            <span className="ml-3 truncate text-xs text-muted">
              /{selectedPage.page_slug}
            </span>
          </div>
          <iframe
            title={`${selectedPage.page_name} preview`}
            srcDoc={html}
            className="h-[34rem] w-full bg-white"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted">
          No pages are available to preview.
        </div>
      )}
    </section>
  );
}
