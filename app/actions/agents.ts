"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildAgentOutput,
  buildAgentReasoning,
  buildPromptStack,
  mergeAgentOutputs,
  type AgentRecord,
} from "@/lib/agents";
import type { Json } from "@/lib/database.types";
import { ensureDefaultProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function agentRedirect(message: string, runId?: string, projectId?: string): never {
  const params = new URLSearchParams({ agentMessage: message });

  if (runId) {
    params.set("agentRunId", runId);
  }

  if (projectId) {
    params.set("projectId", projectId);
  }

  redirect(`/dashboard?${params.toString()}#agents`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to run ORIVOO agents.");
  }

  return { supabase, user };
}

async function getAccessibleProject(projectId: string) {
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
    .maybeSingle();

  if (error) {
    agentRedirect(error.message);
  }

  if (!project) {
    agentRedirect("Project not found.");
  }

  return { supabase, user, project };
}

export async function saveProjectMemory(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const content = getFormString(formData, "content");
  const { supabase, user, project } = await getAccessibleProject(projectId);

  const { error } = await supabase.from("project_memory").upsert(
    {
      project_id: project.id,
      user_id: user.id,
      content,
    },
    { onConflict: "project_id" },
  );

  if (error) {
    agentRedirect(error.message, undefined, project.id);
  }

  revalidatePath("/dashboard");
  agentRedirect("Project memory saved.", undefined, project.id);
}

export async function runOrivooAgents(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const title = getFormString(formData, "title");
  const userMessage = getFormString(formData, "userMessage");
  const conversationHistory = getFormString(formData, "conversationHistory");
  const selectedAgentIds = formData
    .getAll("agentIds")
    .filter((value): value is string => typeof value === "string");

  if (!title) {
    agentRedirect("Add a title for the agent run.", undefined, projectId);
  }

  if (!userMessage) {
    agentRedirect("Add a user message for the agents.", undefined, projectId);
  }

  if (selectedAgentIds.length === 0) {
    agentRedirect("Select at least one agent.", undefined, projectId);
  }

  const { supabase, user, project } = await getAccessibleProject(projectId);
  const { data: memory } = await supabase
    .from("project_memory")
    .select("content")
    .eq("project_id", project.id)
    .maybeSingle();
  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("id, name, description, system_prompt, created_at")
    .in("id", selectedAgentIds);

  if (agentsError) {
    agentRedirect(agentsError.message, undefined, project.id);
  }

  if (!agents || agents.length === 0) {
    agentRedirect("Selected agents were not found.", undefined, project.id);
  }

  const { data: run, error: runError } = await supabase
    .from("agent_runs")
    .insert({
      project_id: project.id,
      user_id: user.id,
      title,
      user_message: userMessage,
      conversation_history: conversationHistory,
      selected_agent_ids: agents.map((agent) => agent.id),
      status: "running",
    })
    .select("id")
    .single();

  if (runError) {
    agentRedirect(runError.message, undefined, project.id);
  }

  try {
    const projectMemory = memory?.content ?? "";
    const agentOutputs = agents.map((agent) => {
      const agentRecord: AgentRecord = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        system_prompt: agent.system_prompt,
      };
      const promptStack = buildPromptStack({
        agent: agentRecord,
        projectMemory,
        conversationHistory,
        userMessage,
      });
      const reasoning = buildAgentReasoning({
        agent: agentRecord,
        projectMemory,
        conversationHistory,
        userMessage,
      });
      const output = buildAgentOutput({
        agent: agentRecord,
        userMessage,
      });

      return {
        agent,
        promptStack,
        reasoning,
        output,
      };
    });
    const mergedOutput = mergeAgentOutputs({
      title,
      userMessage,
      outputs: agentOutputs.map((item) => ({
        agentName: item.agent.name,
        output: item.output,
      })),
    });
    const metadata: Json = {
      source: "agent_framework",
      agent_run_id: run.id,
      agents: agentOutputs.map((item) => ({
        id: item.agent.id,
        name: item.agent.name,
        description: item.agent.description,
      })),
      architecture: [
        "Master Prompt",
        "Studio Prompt",
        "Agent Prompt",
        "Project Memory",
        "Conversation History",
        "User Message",
      ],
      future_providers: ["OpenAI", "Claude", "Groq", "Gemini"],
    };
    const { data: artifact, error: artifactError } = await supabase
      .from("artifacts")
      .insert({
        project_id: project.id,
        user_id: user.id,
        title,
        artifact_type: "document",
        content: mergedOutput,
        metadata,
      })
      .select("id")
      .single();

    if (artifactError) {
      throw new Error(artifactError.message);
    }

    const { error: resultsError } = await supabase
      .from("agent_run_results")
      .insert(
        agentOutputs.map((item) => ({
          agent_run_id: run.id,
          agent_id: item.agent.id,
          project_id: project.id,
          user_id: user.id,
          reasoning: item.reasoning,
          output: [
            item.output,
            "",
            "## Prompt Stack Used",
            "",
            "The framework composed Master Prompt + Studio Prompt + Agent Prompt + Project Memory + Conversation History + User Message for this agent.",
          ].join("\n"),
        })),
      );

    if (resultsError) {
      throw new Error(resultsError.message);
    }

    const { error: completeError } = await supabase
      .from("agent_runs")
      .update({
        status: "completed",
        merged_output: mergedOutput,
        result_artifact_id: artifact.id,
      })
      .eq("id", run.id)
      .eq("project_id", project.id);

    if (completeError) {
      throw new Error(completeError.message);
    }

    revalidatePath("/dashboard");
    agentRedirect(
      "Agents completed and saved a merged artifact.",
      run.id,
      project.id,
    );
  } catch (error) {
    await supabase
      .from("agent_runs")
      .update({ status: "failed" })
      .eq("id", run.id)
      .eq("project_id", project.id);

    revalidatePath("/dashboard");
    agentRedirect(
      error instanceof Error ? error.message : "Agent run failed.",
      run.id,
      project.id,
    );
  }
}
