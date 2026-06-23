"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user };
}

async function uploadDocument(file: File | null, userId: string, folder: string) {
  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await (await createClient()).storage
    .from("vp23-documents")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function createDocument(input: {
  ownerId: string;
  companyId: string;
  title: string;
  storagePath: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      owner_id: input.ownerId,
      company_id: input.companyId,
      document_type: "other",
      title: input.title,
      storage_path: input.storagePath,
      metadata: { workflow: "business_claim" },
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Document could not be created.");
  }

  return String(data.id);
}

export async function submitBusinessClaim(formData: FormData) {
  const { supabase, user } = await requireUser();
  const companyId = formString(formData, "companyId");
  const claimantName = formString(formData, "claimantName");
  const claimantEmail = formString(formData, "claimantEmail");
  const claimantPhone = formString(formData, "claimantPhone");
  const ownershipNotes = formString(formData, "ownershipNotes");
  const ownershipDocument = formFile(formData, "ownershipDocument");

  if (!companyId || !claimantName || !claimantEmail || !ownershipDocument) {
    redirectWithMessage("/claim-business", "Claim details and ownership document are required.");
  }

  const storagePath = await uploadDocument(ownershipDocument, user.id, "claims");
  if (!storagePath) {
    redirectWithMessage("/claim-business", "Ownership document upload failed.");
  }

  const documentId = await createDocument({
    ownerId: user.id,
    companyId,
    title: claimantName,
    storagePath,
  });
  const { error } = await supabase.from("company_claims").upsert({
    company_id: companyId,
    claimant_id: user.id,
    claimant_name: claimantName,
    claimant_email: claimantEmail,
    claimant_phone: claimantPhone || null,
    ownership_notes: ownershipNotes || null,
    evidence_document_id: documentId,
    status: "pending",
  });

  if (error) {
    redirectWithMessage("/claim-business", error.message);
  }

  revalidatePath("/claim-business");
  revalidatePath("/admin/beta");
  redirect("/claim-business?message=Business claim submitted.");
}

export async function createProfessionalInvitation(formData: FormData) {
  const { supabase, user } = await requireUser();
  const email = formString(formData, "email");
  const companyId = formString(formData, "companyId") || null;
  const message = formString(formData, "message");
  const token = crypto.randomUUID();

  if (!email) {
    redirectWithMessage("/invite-professionals", "Professional email is required.");
  }

  const { error } = await supabase.from("professional_invitations").insert({
    invited_by: user.id,
    company_id: companyId,
    email,
    message: message || null,
    invite_token: token,
    status: "pending",
  });

  if (error) {
    redirectWithMessage("/invite-professionals", error.message);
  }

  revalidatePath("/invite-professionals");
  redirect(
    `/invite-professionals?message=${encodeURIComponent(`${getSiteUrl()}/signup?invite=${token}`)}`,
  );
}

export async function decideBusinessClaim(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const claimId = formString(formData, "claimId");
  const decision = formString(formData, "decision");
  const status = decision === "approved" ? "approved" : "rejected";
  const { data: claim, error: claimError } = await supabase
    .from("company_claims")
    .select("id, company_id, claimant_id")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    redirectWithMessage("/admin/beta", "Business claim not found.");
  }
  const claimRow = claim as {
    company_id: string;
    claimant_id: string;
  };

  const { error } = await supabase
    .from("company_claims")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (error) {
    redirectWithMessage("/admin/beta", error.message);
  }

  if (status === "approved") {
    await supabase
      .from("companies")
      .update({
        owner_id: claimRow.claimant_id,
        claimed_by: claimRow.claimant_id,
        claimed_at: new Date().toISOString(),
        is_business_verified: true,
      })
      .eq("id", claimRow.company_id);
  }

  revalidatePath("/admin/beta");
  revalidatePath("/professionals");
  redirect("/admin/beta?message=Business claim updated.");
}

export async function updateFeaturedPlacement(formData: FormData) {
  const { supabase } = await requireAdmin();
  const companyId = formString(formData, "companyId");
  const isFeatured = formString(formData, "isFeatured") === "true";
  const featuredRank = Number(formString(formData, "featuredRank")) || 0;
  const featuredUntil = formString(formData, "featuredUntil") || null;
  const { error } = await supabase
    .from("companies")
    .update({
      is_featured: isFeatured,
      featured_rank: featuredRank,
      featured_until: featuredUntil,
    })
    .eq("id", companyId);

  if (error) {
    redirectWithMessage("/admin/beta", error.message);
  }

  revalidatePath("/admin/beta");
  revalidatePath("/professionals");
  revalidatePath("/featured-professionals");
  redirect("/admin/beta?message=Featured placement updated.");
}
