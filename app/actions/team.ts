"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canAssignRole, isTeamPlan } from "@/lib/team";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function teamRedirect(message: string, projectId?: string): never {
  const params = new URLSearchParams({ teamMessage: message });

  if (projectId) {
    params.set("projectId", projectId);
  }

  redirect(`/dashboard?${params.toString()}#team`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage team workspaces.");
  }

  return { supabase, user };
}

async function requireTeamPlan(projectId: string) {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    teamRedirect(error.message, projectId);
  }

  if (!isTeamPlan(profile?.subscription_tier)) {
    teamRedirect(
      "Team workspaces are enabled for Business and Enterprise plans only.",
      projectId,
    );
  }

  return { supabase, user };
}

async function requireManageAccess(projectId: string) {
  const { supabase, user } = await requireTeamPlan(projectId);
  const { data: role, error } = await supabase.rpc(
    "current_user_project_role",
    {
      target_project_id: projectId,
    },
  );

  if (error) {
    teamRedirect(error.message, projectId);
  }

  if (role !== "owner" && role !== "admin") {
    teamRedirect("Only owners and admins can manage team members.", projectId);
  }

  return { supabase, user, role };
}

async function requireOwnerAccess(projectId: string) {
  const access = await requireManageAccess(projectId);

  if (access.role !== "owner") {
    teamRedirect("Only the project owner can transfer ownership.", projectId);
  }

  return access;
}

export async function inviteProjectMember(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const userId = getFormString(formData, "userId");
  const role = getFormString(formData, "role");

  if (!projectId) {
    teamRedirect("Select a project before inviting members.");
  }

  if (!userId) {
    teamRedirect("Enter an existing Supabase user ID to invite.", projectId);
  }

  if (!canAssignRole(role)) {
    teamRedirect("Invite members as admin, editor, or viewer.", projectId);
  }

  const { supabase } = await requireManageAccess(projectId);
  const { error } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: userId,
    role,
  });

  if (error) {
    teamRedirect(error.message, projectId);
  }

  revalidatePath("/dashboard");
  teamRedirect("Team member invited.", projectId);
}

export async function updateProjectMemberRole(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const memberId = getFormString(formData, "memberId");
  const role = getFormString(formData, "role");

  if (!projectId || !memberId) {
    teamRedirect("Select a member to update.", projectId);
  }

  if (!canAssignRole(role)) {
    teamRedirect("Choose admin, editor, or viewer for role updates.", projectId);
  }

  const { supabase } = await requireManageAccess(projectId);
  const { data: member, error: lookupError } = await supabase
    .from("project_members")
    .select("role")
    .eq("id", memberId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (lookupError) {
    teamRedirect(lookupError.message, projectId);
  }

  if (!member) {
    teamRedirect("Team member not found.", projectId);
  }

  if (member.role === "owner") {
    teamRedirect("Use transfer ownership to change the owner.", projectId);
  }

  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("id", memberId)
    .eq("project_id", projectId);

  if (error) {
    teamRedirect(error.message, projectId);
  }

  revalidatePath("/dashboard");
  teamRedirect("Team member role updated.", projectId);
}

export async function removeProjectMember(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const memberId = getFormString(formData, "memberId");

  if (!projectId || !memberId) {
    teamRedirect("Select a member to remove.", projectId);
  }

  const { supabase } = await requireManageAccess(projectId);
  const { data: member, error: lookupError } = await supabase
    .from("project_members")
    .select("role")
    .eq("id", memberId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (lookupError) {
    teamRedirect(lookupError.message, projectId);
  }

  if (!member) {
    teamRedirect("Team member not found.", projectId);
  }

  if (member.role === "owner") {
    teamRedirect("Transfer ownership before removing the owner.", projectId);
  }

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)
    .eq("project_id", projectId);

  if (error) {
    teamRedirect(error.message, projectId);
  }

  revalidatePath("/dashboard");
  teamRedirect("Team member removed.", projectId);
}

export async function transferProjectOwnership(formData: FormData) {
  const projectId = getFormString(formData, "projectId");
  const newOwnerUserId = getFormString(formData, "newOwnerUserId");

  if (!projectId) {
    teamRedirect("Select a project before transferring ownership.");
  }

  if (!newOwnerUserId) {
    teamRedirect("Enter the new owner user ID.", projectId);
  }

  const { supabase } = await requireOwnerAccess(projectId);
  const { error } = await supabase.rpc("transfer_project_ownership", {
    target_project_id: projectId,
    new_owner_id: newOwnerUserId,
  });

  if (error) {
    teamRedirect(error.message, projectId);
  }

  revalidatePath("/dashboard");
  teamRedirect("Project ownership transferred.", projectId);
}
