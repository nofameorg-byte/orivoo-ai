import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

export async function ensureDefaultProject(supabase: Supabase, userId: string) {
  const { data: existingProject, error: projectError } = await supabase
    .from("projects")
    .select("id, workspace_id, user_id, name, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (existingProject) {
    return existingProject;
  }

  const { data: existingWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  let workspace = existingWorkspace;

  if (!workspace) {
    const { data: createdWorkspace, error: createWorkspaceError } =
      await supabase
        .from("workspaces")
        .insert({ owner_id: userId })
        .select("id")
        .single();

    if (createWorkspaceError) {
      throw new Error(createWorkspaceError.message);
    }

    workspace = createdWorkspace;
  }

  if (!workspace) {
    throw new Error("Unable to prepare a workspace for file storage.");
  }

  const { data: project, error: createProjectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      user_id: userId,
      name: "Default Project",
    })
    .select("id, workspace_id, user_id, name, created_at, updated_at")
    .single();

  if (createProjectError) {
    throw new Error(createProjectError.message);
  }

  return project;
}
