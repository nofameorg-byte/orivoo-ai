import { RESEARCH_SECTIONS } from "@/lib/research/config";

export type GeneratedResearchSource = {
  source_title: string;
  source_url: string | null;
  source_type: string;
  source_content: string | null;
};

export type GeneratedResearchReport = {
  title: string;
  report_content: string;
  sources: GeneratedResearchSource[];
};

export function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include structured JSON.");
  }

  return candidate.slice(start, end + 1);
}

export function parseGeneratedResearch(text: string): GeneratedResearchReport {
  const parsed = JSON.parse(extractJsonObject(text)) as Partial<GeneratedResearchReport>;

  if (!parsed.title || !parsed.report_content) {
    throw new Error("AI response missed required report fields.");
  }

  return {
    report_content: normalizeReportContent(parsed.report_content),
    sources: Array.isArray(parsed.sources)
      ? parsed.sources.map((source) => ({
          source_content: source.source_content ?? null,
          source_title: source.source_title || "Research source",
          source_type: source.source_type || "reference",
          source_url: source.source_url || null,
        }))
      : [],
    title: parsed.title,
  };
}

export function normalizeReportContent(content: string) {
  const trimmed = content.trim();
  const hasSections = RESEARCH_SECTIONS.every((section) =>
    trimmed.includes(`## ${section}`),
  );

  if (hasSections) {
    return trimmed;
  }

  return `## Executive Summary\n${trimmed}\n\n## Key Findings\n- Review the generated research and add source-backed findings.\n\n## Market Analysis\n- Market analysis pending refinement.\n\n## Opportunities\n- Opportunities pending refinement.\n\n## Risks\n- Risks pending refinement.\n\n## Recommendations\n- Recommendations pending refinement.`;
}

export function getResearchSections(content: string) {
  return RESEARCH_SECTIONS.map((section, index) => {
    const startToken = `## ${section}`;
    const nextSection = RESEARCH_SECTIONS[index + 1];
    const startIndex = content.indexOf(startToken);

    if (startIndex === -1) {
      return {
        body: "No content generated for this section yet.",
        title: section,
      };
    }

    const contentStart = startIndex + startToken.length;
    const nextIndex = nextSection
      ? content.indexOf(`## ${nextSection}`, contentStart)
      : -1;
    const body = content
      .slice(contentStart, nextIndex === -1 ? undefined : nextIndex)
      .trim();

    return {
      body: body || "No content generated for this section yet.",
      title: section,
    };
  });
}

export function appendResearchSection(
  content: string,
  title: string,
  generatedContent: string,
) {
  return `${content.trim()}\n\n## ${title}\n${generatedContent.trim()}`;
}

export function reportToPlainText({
  content,
  projectName,
  sources,
  title,
  topic,
}: {
  content: string;
  projectName: string | null;
  sources: GeneratedResearchSource[];
  title: string;
  topic: string;
}) {
  const sourceText = sources.length
    ? sources
        .map(
          (source, index) =>
            `${index + 1}. ${source.source_title}${
              source.source_url ? ` - ${source.source_url}` : ""
            }\n   ${source.source_content ?? ""}`,
        )
        .join("\n")
    : "No sources saved.";

  return `${title}\nTopic: ${topic}\nProject: ${
    projectName ?? "No project"
  }\n\n${content}\n\n## Sources\n${sourceText}`;
}
