"use client";

import { useState } from "react";
import { getResearchSections } from "@/lib/research/formatting";
import { ResearchActions } from "@/components/research/research-actions";

type ResearchReportContentProps = {
  initialContent: string;
  reportId: string;
};

export function ResearchReportContent({
  initialContent,
  reportId,
}: ResearchReportContentProps) {
  const [content, setContent] = useState(initialContent);
  const sections = getResearchSections(content);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="space-y-5">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-white/10 bg-black/35 p-5"
            >
              <h2 className="text-xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <ResearchActions
        initialContent={initialContent}
        onContentChange={setContent}
        reportId={reportId}
      />
    </div>
  );
}
