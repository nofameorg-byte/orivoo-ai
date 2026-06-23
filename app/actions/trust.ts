"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DocumentType = "license" | "insurance_document" | "photo" | "other";
type MediaType = "photo" | "video";
type VerificationStatus = "approved" | "rejected" | "expired";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
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

async function uploadFile(
  file: File | null,
  userId: string,
  folder: string,
) {
  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await (await createClient()).storage
    .from("vp23-documents")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function createDocumentRecord(input: {
  ownerId: string;
  companyId: string;
  documentType: DocumentType;
  title: string;
  storagePath: string;
  metadata?: Record<string, string>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      owner_id: input.ownerId,
      company_id: input.companyId,
      document_type: input.documentType,
      title: input.title,
      storage_path: input.storagePath,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return String(data.id);
}

async function requireOwnedCompany(companyId: string) {
  const { supabase, user } = await requireUser();
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, owner_id")
    .eq("id", companyId)
    .maybeSingle();

  if (error || !company || company.owner_id !== user.id) {
    redirectWithMessage("/dashboard", "Company access denied.");
  }

  return { supabase, user, companyId: String(company.id) };
}

export async function saveCompanyProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const companyId = formString(formData, "companyId");
  const companyName = formString(formData, "companyName");
  const categoryId = formString(formData, "categoryId") || null;
  const ownerName = formString(formData, "ownerName");
  const description = formString(formData, "description");
  const website = formString(formData, "website");
  const phone = formString(formData, "phone");
  const email = formString(formData, "email");
  const yearsInBusiness = Number(formString(formData, "yearsInBusiness")) || null;
  const serviceAreas = splitList(formString(formData, "serviceAreas"));
  const languages = splitList(formString(formData, "languages")).filter(
    (language) => language === "en" || language === "es",
  );
  const socialMedia = {
    linkedin: formString(formData, "linkedin"),
    facebook: formString(formData, "facebook"),
    instagram: formString(formData, "instagram"),
  };

  if (!companyName) {
    redirectWithMessage("/professionals/profile", "Company name is required.");
  }

  const logoPath = await uploadFile(formFile(formData, "logo"), user.id, "company-media");
  const coverPath = await uploadFile(formFile(formData, "cover"), user.id, "company-media");
  const payload = {
    owner_id: user.id,
    category_id: categoryId,
    company_name: companyName,
    owner_name: ownerName || null,
    description: description || null,
    service_areas: serviceAreas,
    years_in_business: yearsInBusiness,
    website: website || null,
    phone: phone || null,
    email: email || null,
    social_media: socialMedia,
    languages: languages.length ? languages : ["en"],
    ...(logoPath ? { logo_url: logoPath } : {}),
    ...(coverPath ? { cover_image_url: coverPath } : {}),
  };

  if (companyId) {
    const { error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", companyId)
      .eq("owner_id", user.id);

    if (error) {
      redirectWithMessage("/professionals/profile", error.message);
    }
  } else {
    const { error } = await supabase.from("companies").insert(payload);

    if (error) {
      redirectWithMessage("/professionals/profile", error.message);
    }
  }

  revalidatePath("/professionals");
  revalidatePath("/professionals/profile");
  revalidatePath("/dashboard");
  redirect("/professionals/profile?message=Company profile saved.");
}

export async function submitLicenseVerification(formData: FormData) {
  const companyId = formString(formData, "companyId");
  const { user } = await requireOwnedCompany(companyId);
  const licenseNumber = formString(formData, "licenseNumber");
  const licenseType = formString(formData, "licenseType");
  const issuingAuthority = formString(formData, "issuingAuthority");
  const state = formString(formData, "state");
  const expiresAt = formString(formData, "expiresAt") || null;
  const file = formFile(formData, "licenseDocument");

  if (!licenseNumber || !file) {
    redirectWithMessage("/professionals/profile", "License number and document are required.");
  }

  const storagePath = await uploadFile(file, user.id, "licenses");
  if (!storagePath) {
    redirectWithMessage("/professionals/profile", "License document upload failed.");
  }

  const documentId = await createDocumentRecord({
    ownerId: user.id,
    companyId,
    documentType: "license",
    title: licenseType || licenseNumber,
    storagePath,
    metadata: { licenseNumber, state, expiresAt: expiresAt ?? "" },
  });
  const supabase = await createClient();
  const { error: licenseError } = await supabase.from("licenses").insert({
    company_id: companyId,
    license_type: licenseType || null,
    license_number: licenseNumber,
    issuing_authority: issuingAuthority || null,
    state: state || null,
    expires_at: expiresAt,
    document_id: documentId,
    verification_status: "pending",
  });

  if (licenseError) {
    redirectWithMessage("/professionals/profile", licenseError.message);
  }

  const { error: requestError } = await supabase
    .from("verification_requests")
    .insert({
      company_id: companyId,
      verification_type: "license",
      status: "pending",
      submitted_by: user.id,
      evidence_document_id: documentId,
      expires_at: expiresAt,
      notes: licenseType || licenseNumber,
    });

  if (requestError) {
    redirectWithMessage("/professionals/profile", requestError.message);
  }

  revalidatePath("/professionals/profile");
  revalidatePath("/admin");
  redirect("/professionals/profile?message=License verification submitted.");
}

export async function submitInsuranceVerification(formData: FormData) {
  const companyId = formString(formData, "companyId");
  const { user } = await requireOwnedCompany(companyId);
  const providerName = formString(formData, "providerName");
  const policyNumber = formString(formData, "policyNumber");
  const coverageType = formString(formData, "coverageType");
  const expiresAt = formString(formData, "expiresAt") || null;
  const file = formFile(formData, "insuranceDocument");

  if (!providerName || !file) {
    redirectWithMessage("/professionals/profile", "Insurance provider and document are required.");
  }

  const storagePath = await uploadFile(file, user.id, "insurance");
  if (!storagePath) {
    redirectWithMessage("/professionals/profile", "Insurance document upload failed.");
  }

  const documentId = await createDocumentRecord({
    ownerId: user.id,
    companyId,
    documentType: "insurance_document",
    title: providerName,
    storagePath,
    metadata: { policyNumber, coverageType, expiresAt: expiresAt ?? "" },
  });
  const supabase = await createClient();
  const { error: insuranceError } = await supabase
    .from("insurance_policies")
    .insert({
      company_id: companyId,
      provider_name: providerName,
      policy_number: policyNumber || null,
      coverage_type: coverageType || null,
      expires_at: expiresAt,
      document_id: documentId,
      verification_status: "pending",
    });

  if (insuranceError) {
    redirectWithMessage("/professionals/profile", insuranceError.message);
  }

  const { error: requestError } = await supabase
    .from("verification_requests")
    .insert({
      company_id: companyId,
      verification_type: "insurance",
      status: "pending",
      submitted_by: user.id,
      evidence_document_id: documentId,
      expires_at: expiresAt,
      notes: providerName,
    });

  if (requestError) {
    redirectWithMessage("/professionals/profile", requestError.message);
  }

  revalidatePath("/professionals/profile");
  revalidatePath("/admin");
  redirect("/professionals/profile?message=Insurance verification submitted.");
}

export async function decideVerificationRequest(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const requestId = formString(formData, "requestId");
  const decision = formString(formData, "decision") as VerificationStatus;
  const notes = formString(formData, "notes");

  if (!["approved", "rejected", "expired"].includes(decision)) {
    redirectWithMessage("/admin", "Invalid verification decision.");
  }

  const { data: request, error: requestError } = await supabase
    .from("verification_requests")
    .select("id, verification_type, evidence_document_id, expires_at, notes")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    redirectWithMessage("/admin", "Verification request not found.");
  }

  const { error } = await supabase
    .from("verification_requests")
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || request.notes || null,
    })
    .eq("id", requestId);

  if (error) {
    redirectWithMessage("/admin", error.message);
  }

  if (request.evidence_document_id && request.verification_type === "license") {
    await supabase
      .from("licenses")
      .update({ verification_status: decision })
      .eq("document_id", request.evidence_document_id);
  }

  if (request.evidence_document_id && request.verification_type === "insurance") {
    await supabase
      .from("insurance_policies")
      .update({ verification_status: decision })
      .eq("document_id", request.evidence_document_id);
  }

  revalidatePath("/admin");
  revalidatePath("/professionals");
  revalidatePath("/professionals/profile");
  redirect("/admin?message=Verification request updated.");
}

export async function createReview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const companyId = formString(formData, "companyId");
  const jobId = formString(formData, "jobId");
  const rating = Number(formString(formData, "rating"));
  const title = formString(formData, "title");
  const body = formString(formData, "body");

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      company_id: companyId,
      customer_id: user.id,
      job_id: jobId,
      rating,
      title,
      body,
    })
    .select("id")
    .single();

  if (error || !review) {
    redirectWithMessage(
      "/professionals/profile",
      error?.message ?? "Review could not be created.",
    );
  }

  for (const key of ["photo", "video"] as const) {
    const file = formFile(formData, key);
    const storagePath = await uploadFile(file, user.id, "review-media");

    if (storagePath) {
      await supabase.from("review_media").insert({
        review_id: review.id,
        uploaded_by: user.id,
        media_type: key as MediaType,
        storage_path: storagePath,
      });
    }
  }

  revalidatePath("/professionals/profile");
  redirect("/professionals/profile?message=Review submitted.");
}

export async function editReview(formData: FormData) {
  const { supabase } = await requireUser();
  const reviewId = formString(formData, "reviewId");
  const rating = Number(formString(formData, "rating"));
  const title = formString(formData, "title");
  const body = formString(formData, "body");
  const { error } = await supabase
    .from("reviews")
    .update({ rating, title, body })
    .eq("id", reviewId);

  if (error) {
    redirectWithMessage("/professionals/profile", error.message);
  }

  revalidatePath("/professionals/profile");
  redirect("/professionals/profile?message=Review updated.");
}

export async function flagReview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const reviewId = formString(formData, "reviewId");
  const reason = formString(formData, "reason");

  await supabase.from("review_flags").upsert({
    review_id: reviewId,
    flagged_by: user.id,
    reason,
    status: "pending",
  });
  await supabase.from("reviews").update({ is_flagged: true }).eq("id", reviewId);

  revalidatePath("/professionals/profile");
  revalidatePath("/admin");
  redirect("/professionals/profile?message=Review flagged.");
}

export async function respondToReview(formData: FormData) {
  const { supabase } = await requireUser();
  const reviewId = formString(formData, "reviewId");
  const response = formString(formData, "response");
  const { error } = await supabase
    .from("reviews")
    .update({
      professional_response: response,
      professional_responded_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) {
    redirectWithMessage("/professionals/profile", error.message);
  }

  revalidatePath("/professionals/profile");
  redirect("/professionals/profile?message=Review response saved.");
}

export async function markReviewHelpful(formData: FormData) {
  const { supabase, user } = await requireUser();
  const reviewId = formString(formData, "reviewId");
  await supabase.from("review_helpful_votes").upsert({
    review_id: reviewId,
    voter_id: user.id,
  });

  revalidatePath("/professionals/profile");
  redirect("/professionals/profile?message=Helpful vote saved.");
}

export async function moderateReview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const reviewId = formString(formData, "reviewId");
  const decision = formString(formData, "decision");
  const removeReview = decision === "remove";
  const { error } = await supabase
    .from("reviews")
    .update({
      is_removed: removeReview,
      is_flagged: false,
    })
    .eq("id", reviewId);

  if (error) {
    redirectWithMessage("/admin", error.message);
  }

  await supabase
    .from("review_flags")
    .update({
      status: removeReview ? "approved" : "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("review_id", reviewId);

  revalidatePath("/admin");
  revalidatePath("/professionals/profile");
  redirect("/admin?message=Review moderation updated.");
}
