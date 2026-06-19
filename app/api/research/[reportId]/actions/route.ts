import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import {
  RESEARCH_ACTIONS,
  type ResearchAction,
} from "@/lib/research/config";
import { getMemoryContext } from "@/lib/core/memory";
import { appendResearchSection } from "@/lib/research/formatting";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

type ActionBody = {
  action?: ResearchAction;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isResearchAction(action: string | undefined): action is ResearchAction {
  return Boolean(action && action in RESEARCH_ACTIONS);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  const { reportId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication required.", 401);
  }

  let body: ActionBody;

  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return jsonError("Invalid JSON body.");
  }

  if (!isResearchAction(body.action)) {
    return jsonError("Choose a valid research action.");
  }

  const { data: report, error: reportError } = await supabase
    .from("research_reports")
    .select("id,title,topic,project_id,report_content")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .single();

  if (reportError || !report) {
    return jsonError("Research report not found.", 404);
  }

  const action = RESEARCH_ACTIONS[body.action];
  const groq = new Groq({ apiKey: groqApiKey });
  const memoryContext = await getMemoryContext({
    projectId: report.project_id,
    userId: user.id,
  });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Research Studio. Generate rigorous, structured research outputs. Use markdown bullets and clearly label assumptions.`,
        },
        {
          role: "user",
          content: `${action.prompt}

Topic: ${report.topic}
Report title: ${report.title}

Existing report:
${report.report_content}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.25,
    });

    const result =
      completion.choices[0]?.message?.content?.trim() ??
      "ORIVOO could not generate this research action.";
    const updatedContent = appendResearchSection(
      report.report_content,
      action.label,
      result,
    );

    const { error: updateError } = await supabase
      .from("research_reports")
      .update({ report_content: updatedContent })
      .eq("id", report.id)
      .eq("user_id", user.id);

    if (updateError) {
      return jsonError("Could not save generated research action.", 500);
    }

    return NextResponse.json({
      report_content: updatedContent,
      result,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "ORIVOO Research Studio could not complete this action.",
      500,
    );
  }
}
