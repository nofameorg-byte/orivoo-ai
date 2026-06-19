"use server";

import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { incrementUsage } from "@/lib/billing/usage";
import { getMemoryContext } from "@/lib/core/memory";
import { createNotification } from "@/lib/core/notifications";
import { parseGeneratedResearch } from "@/lib/research/formatting";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to use ORIVOO Research Studio.");
  }

  return { supabase, userId: user.id };
}

async function verifyProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | null,
  userId: string,
) {
  if (!projectId) {
    return null;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id,name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !project) {
    redirect("/dashboard/research?message=Project not found.");
  }

  return project;
}

export async function createResearchReport(formData: FormData) {
  const topic = formString(formData, "topic");
  const projectId = formString(formData, "projectId") || null;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!topic) {
    redirect("/dashboard/research?message=Enter a research topic.");
  }

  if (!groqApiKey) {
    redirect("/dashboard/research?message=Missing GROQ_API_KEY.");
  }

  const { supabase, userId } = await getUserContext();
  const project = await verifyProject(supabase, projectId, userId);
  const groq = new Groq({ apiKey: groqApiKey });
  const memoryContext = await getMemoryContext({ projectId, userId });

  let generated;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Research Studio, a senior intelligence and research engine. Produce structured, practical research for operators. Return only valid JSON.`,
        },
        {
          role: "user",
          content: `Create a strategic research report for this topic: "${topic}".

Project context: ${project?.name ?? "No project selected"}.

Return JSON exactly like:
{
  "title": "Concise report title",
  "report_content": "Markdown with these exact headings: ## Executive Summary, ## Key Findings, ## Market Analysis, ## Opportunities, ## Risks, ## Recommendations",
  "sources": [
    {
      "source_title": "Source or recommended research source",
      "source_url": "https://example.com or null",
      "source_type": "market|government|competitor|grant|industry|reference",
      "source_content": "One-sentence relevance summary"
    }
  ]
}

If you cannot verify live facts, say so clearly and include recommended authoritative sources to validate.`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.25,
    });

    generated = parseGeneratedResearch(
      completion.choices[0]?.message?.content ?? "",
    );
  } catch {
    redirect(
      "/dashboard/research?message=ORIVOO could not generate a structured report. Please try again.",
    );
  }

  const { data: report, error: reportError } = await supabase
    .from("research_reports")
    .insert({
      project_id: projectId,
      report_content: generated.report_content,
      title: generated.title,
      topic,
      user_id: userId,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    redirect("/dashboard/research?message=Could not save research report.");
  }

  if (generated.sources.length) {
    await supabase.from("research_sources").insert(
      generated.sources.map((source) => ({
        report_id: report.id,
        source_content: source.source_content,
        source_title: source.source_title,
        source_type: source.source_type,
        source_url: source.source_url,
      })),
    );
  }

  await createNotification({
    body: `${generated.title} is ready in Research Studio.`,
    metadata: { reportId: report.id },
    title: "Research report complete",
    type: "research_completion",
    userId,
  });
  await incrementUsage({
    metric: "reports_generated",
    userId,
  });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/research/${report.id}`);
}

export async function assignResearchReportToProject(formData: FormData) {
  const reportId = formString(formData, "reportId");
  const projectId = formString(formData, "projectId") || null;
  const { supabase, userId } = await getUserContext();

  await verifyProject(supabase, projectId, userId);

  const { error } = await supabase
    .from("research_reports")
    .update({ project_id: projectId })
    .eq("id", reportId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/research/${reportId}?message=Could not update project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/research/${reportId}`);
}

export async function deleteResearchReport(formData: FormData) {
  const reportId = formString(formData, "reportId");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard/research";
  const { supabase, userId } = await getUserContext();

  const { error } = await supabase
    .from("research_reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", userId);

  if (error) {
    redirect(`${redirectTo}?message=Could not delete report.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${redirectTo}?message=Report deleted.`);
}
