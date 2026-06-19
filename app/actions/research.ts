"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/lib/database.types";
import { ensureDefaultProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

type ResearchSource = {
  title: string;
  url: string;
  excerpt: string;
};

const MAX_SOURCES = 5;
const workflowSteps = [
  "Queued research job",
  "Gathered source material",
  "Extracted findings",
  "Generated structured report",
  "Saved report artifact",
];

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function researchRedirect(message: string, jobId?: string): never {
  const params = new URLSearchParams({ researchMessage: message });

  if (jobId) {
    params.set("researchJobId", jobId);
  }

  redirect(`/dashboard?${params.toString()}#research`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to use Deep Research.");
  }

  return { supabase, user };
}

async function getOwnedProject(projectId: string) {
  const { supabase, user } = await requireUser();

  if (!projectId) {
    return {
      supabase,
      user,
      project: await ensureDefaultProject(supabase, user.id),
    };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    researchRedirect(error.message);
  }

  if (!project) {
    researchRedirect("Project not found.");
  }

  return { supabase, user, project };
}

function parseSourceUrls(value: string) {
  return value
    .split(/\s+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    })
    .slice(0, MAX_SOURCES);
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitleFromHtml(html: string, fallbackUrl: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  if (title) {
    return stripHtml(title).slice(0, 140);
  }

  try {
    return new URL(fallbackUrl).hostname;
  } catch {
    return "Research source";
  }
}

async function fetchSourceUrl(url: string): Promise<ResearchSource | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ORIVOO-AI-Research/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const title = getTitleFromHtml(html, url);
    const excerpt = stripHtml(html).slice(0, 900);

    if (!excerpt) {
      return null;
    }

    return { title, url, excerpt };
  } catch {
    return null;
  }
}

async function searchWikipedia(query: string): Promise<ResearchSource[]> {
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.searchParams.set("action", "query");
  endpoint.searchParams.set("list", "search");
  endpoint.searchParams.set("srsearch", query);
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("origin", "*");
  endpoint.searchParams.set("srlimit", MAX_SOURCES.toString());

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "ORIVOO-AI-Research/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      query?: {
        search?: Array<{
          title?: string;
          snippet?: string;
        }>;
      };
    };

    return (payload.query?.search ?? [])
      .filter((result) => result.title && result.snippet)
      .map((result) => ({
        title: result.title ?? "Wikipedia source",
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
          (result.title ?? "").replaceAll(" ", "_"),
        )}`,
        excerpt: stripHtml(result.snippet ?? ""),
      }));
  } catch {
    return [];
  }
}

async function gatherSources(query: string, rawUrls: string) {
  const urls = parseSourceUrls(rawUrls);

  if (urls.length > 0) {
    const sources = (await Promise.all(urls.map(fetchSourceUrl))).filter(
      (source): source is ResearchSource => Boolean(source),
    );

    if (sources.length > 0) {
      return sources;
    }
  }

  const wikipediaSources = await searchWikipedia(query);

  if (wikipediaSources.length > 0) {
    return wikipediaSources;
  }

  return [
    {
      title: "Research brief",
      url: "about:blank",
      excerpt:
        "No external sources were reachable during this run. The report preserves the research question and recommended next steps for manual source review.",
    },
  ];
}

function sentenceFromExcerpt(excerpt: string) {
  const sentence = excerpt.match(/[^.!?]+[.!?]/)?.[0] ?? excerpt;
  return sentence.trim().slice(0, 260);
}

function buildResearchReport(query: string, sources: ResearchSource[]) {
  const findings = sources.map((source, index) => {
    const citation = index + 1;
    return `- ${sentenceFromExcerpt(source.excerpt)} [${citation}]`;
  });
  const sourceList = sources.map(
    (source, index) => `${index + 1}. ${source.title} - ${source.url}`,
  );

  return [
    "# Executive Summary",
    "",
    `This deep research report examines: ${query}. ORIVOO reviewed ${
      sources.length
    } source${sources.length === 1 ? "" : "s"} and synthesized the material into a project-ready artifact.`,
    "",
    "# Key Findings",
    "",
    ...findings,
    "",
    "# Analysis",
    "",
    `The available source material points to several considerations for "${query}". The strongest signals are captured in the findings above and should be validated against primary sources before high-impact decisions. Where sources disagree or provide partial coverage, ORIVOO preserves citations so the project team can inspect the underlying context.`,
    "",
    "# Recommendations",
    "",
    "- Review each cited source and confirm it is current and authoritative.",
    "- Convert high-confidence findings into project tasks, briefs, or follow-up research questions.",
    "- Add domain-specific sources to future research runs when a narrower evidence base is needed.",
    "- Re-run this research when new material or monitoring support is available.",
    "",
    "# Sources",
    "",
    ...sourceList,
  ].join("\n");
}

export async function startDeepResearch(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const title = getFormString(formData, "title");
  const query = getFormString(formData, "query");
  const sourceUrls = getFormString(formData, "sourceUrls");
  const researchMode = getFormString(formData, "researchMode") === "on";

  if (!researchMode) {
    researchRedirect("Turn on Research Mode before starting a deep run.");
  }

  if (!title) {
    researchRedirect("Add a title for this research job.");
  }

  if (!query) {
    researchRedirect("Add a research question.");
  }

  const { supabase, user, project } = await getOwnedProject(projectId);
  const { data: job, error: createJobError } = await supabase
    .from("research_jobs")
    .insert({
      project_id: project.id,
      user_id: user.id,
      title,
      query,
      status: "queued",
    })
    .select("id")
    .single();

  if (createJobError) {
    researchRedirect(createJobError.message);
  }

  try {
    await supabase
      .from("research_jobs")
      .update({ status: "running" })
      .eq("id", job.id)
      .eq("user_id", user.id);

    const sources = await gatherSources(query, sourceUrls);
    const report = buildResearchReport(query, sources);
    const metadata: Json = {
      source: "deep_research",
      research_job_id: job.id,
      query,
      citations: sources,
      workflow_steps: workflowSteps,
      future_support: [
        "scheduled_research",
        "monitoring_topics",
        "auto_update_reports",
      ],
    };
    const { data: artifact, error: artifactError } = await supabase
      .from("artifacts")
      .insert({
        project_id: project.id,
        user_id: user.id,
        title,
        artifact_type: "research",
        content: report,
        metadata,
      })
      .select("id")
      .single();

    if (artifactError) {
      throw new Error(artifactError.message);
    }

    const { error: completeError } = await supabase
      .from("research_jobs")
      .update({
        status: "completed",
        result_artifact_id: artifact.id,
      })
      .eq("id", job.id)
      .eq("user_id", user.id);

    if (completeError) {
      throw new Error(completeError.message);
    }

    revalidatePath("/dashboard");
    researchRedirect("Deep research completed and saved as an artifact.", job.id);
  } catch (error) {
    await supabase
      .from("research_jobs")
      .update({ status: "failed" })
      .eq("id", job.id)
      .eq("user_id", user.id);

    revalidatePath("/dashboard");
    researchRedirect(
      error instanceof Error ? error.message : "Deep research failed.",
      job.id,
    );
  }
}
