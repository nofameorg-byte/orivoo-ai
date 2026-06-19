"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/core/auth";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function canManageOrganization(organizationId: string, userId: string) {
  const { supabase } = await getAuthenticatedUser();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .single();

  return data?.role === "owner" || data?.role === "admin";
}

export async function createOrganization(formData: FormData) {
  const name = formString(formData, "name");
  const { supabase, user } = await getAuthenticatedUser();

  if (!name) {
    redirect("/dashboard/organization?message=Organization name is required.");
  }

  const { data: organization, error } = await supabase
    .from("organizations")
    .insert({
      name,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error || !organization) {
    redirect("/dashboard/organization?message=Could not create organization.");
  }

  await supabase.from("organization_members").insert({
    organization_id: organization.id,
    role: "owner",
    user_id: user.id,
  });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/organization?organizationId=${organization.id}`);
}

export async function inviteUser(formData: FormData) {
  const organizationId = formString(formData, "organizationId");
  const email = formString(formData, "email").toLowerCase();
  const role = formString(formData, "role") || "member";
  const { supabase, user } = await getAuthenticatedUser();

  if (!organizationId || !email) {
    redirect("/dashboard/team?message=Organization and email are required.");
  }

  if (!(await canManageOrganization(organizationId, user.id))) {
    redirect("/dashboard/team?message=You do not have permission to invite users.");
  }

  await supabase.from("invites").insert({
    email,
    organization_id: organizationId,
    role: role === "admin" || role === "viewer" ? role : "member",
    status: "pending",
  });

  redirect(`/dashboard/team?organizationId=${organizationId}&message=Invite sent.`);
}

export async function acceptInvite(formData: FormData) {
  const inviteId = formString(formData, "inviteId");
  const { supabase, user } = await getAuthenticatedUser();
  const { data: invite } = await supabase
    .from("invites")
    .select("id,organization_id,email,role,status")
    .eq("id", inviteId)
    .eq("status", "pending")
    .single();

  if (!invite || invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    redirect("/dashboard/team?message=Invite not found.");
  }

  await supabase.from("organization_members").upsert(
    {
      organization_id: invite.organization_id,
      role: invite.role,
      user_id: user.id,
    },
    { onConflict: "organization_id,user_id" },
  );
  await supabase
    .from("invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/team?organizationId=${invite.organization_id}&message=Invite accepted.`);
}

export async function updateMemberRole(formData: FormData) {
  const organizationId = formString(formData, "organizationId");
  const memberId = formString(formData, "memberId");
  const role = formString(formData, "role") || "member";
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await canManageOrganization(organizationId, user.id))) {
    redirect("/dashboard/team?message=You do not have permission to update roles.");
  }

  await supabase
    .from("organization_members")
    .update({ role: role === "admin" || role === "viewer" ? role : "member" })
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  redirect(`/dashboard/team?organizationId=${organizationId}&message=Role updated.`);
}

export async function removeMember(formData: FormData) {
  const organizationId = formString(formData, "organizationId");
  const memberId = formString(formData, "memberId");
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await canManageOrganization(organizationId, user.id))) {
    redirect("/dashboard/team?message=You do not have permission to remove users.");
  }

  await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  redirect(`/dashboard/team?organizationId=${organizationId}&message=Member removed.`);
}

export async function revokeInvite(formData: FormData) {
  const organizationId = formString(formData, "organizationId");
  const inviteId = formString(formData, "inviteId");
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await canManageOrganization(organizationId, user.id))) {
    redirect("/dashboard/team?message=You do not have permission to revoke invites.");
  }

  await supabase
    .from("invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("organization_id", organizationId);

  redirect(`/dashboard/team?organizationId=${organizationId}&message=Invite revoked.`);
}
