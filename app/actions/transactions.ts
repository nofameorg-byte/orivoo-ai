"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWorkflowNotification } from "@/lib/notifications";
import {
  canConvertQuoteToJob,
  canCustomerAcceptJob,
  canProfessionalSetJobStatus,
  canRespondToQuote,
} from "@/lib/workflow-rules";
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

async function uploadQuoteMedia(file: File | null, userId: string) {
  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/quote-media/${crypto.randomUUID()}.${extension}`;
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

export async function requestQuote(formData: FormData) {
  const { supabase, user } = await requireUser();
  const companyId = formString(formData, "companyId") || null;
  const categoryId = formString(formData, "categoryId") || null;
  const title = formString(formData, "title");
  const projectDetails = formString(formData, "projectDetails");
  const location = formString(formData, "location");
  const serviceArea = formString(formData, "serviceArea");
  const preferredLanguage = formString(formData, "preferredLanguage") === "es" ? "es" : "en";
  const media = await uploadQuoteMedia(formFile(formData, "projectPhoto"), user.id);

  if (!companyId || !title || !projectDetails) {
    redirectWithMessage("/quotes", "Company, title, and project details are required.");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("owner_id, company_name")
    .eq("id", companyId)
    .maybeSingle();
  const companyRow = company as {
    owner_id?: string | null;
    company_name?: string | null;
  } | null;
  const { error } = await supabase.from("quote_requests").insert({
    customer_id: user.id,
    company_id: companyId,
    category_id: categoryId,
    title,
    project_details: projectDetails,
    location: location || null,
    service_area: serviceArea || null,
    preferred_language: preferredLanguage,
    media_urls: media ? [media] : [],
    status: "pending",
  });

  if (error) {
    redirectWithMessage("/quotes", error.message);
  }

  await createWorkflowNotification(supabase, {
    recipientId: companyRow?.owner_id,
    actorId: user.id,
    title: "New quote request",
    body: title,
    type: "quote_received",
    data: { companyId, title },
  });

  revalidatePath("/dashboard/quotes");
  redirect("/dashboard/quotes?message=Quote request submitted.");
}

export async function respondToQuote(formData: FormData) {
  const { supabase, user } = await requireUser();
  const quoteId = formString(formData, "quoteId");
  const decision = formString(formData, "decision");
  const professionalResponse = formString(formData, "professionalResponse");
  const status = decision === "accepted" ? "accepted" : "declined";
  const { data: quote } = await supabase
    .from("quote_requests")
    .select("id, customer_id, status, title, companies(owner_id)")
    .eq("id", quoteId)
    .single();
  const quoteRow = quote as {
    customer_id?: string | null;
    status?: string | null;
    title?: string | null;
    companies?: { owner_id?: string | null } | null;
  } | null;

  if (quoteRow?.companies?.owner_id !== user.id) {
    redirectWithMessage("/dashboard/quotes", "Only the company owner can respond to quotes.");
  }

  if (!canRespondToQuote(quoteRow.status)) {
    redirectWithMessage("/dashboard/quotes", "This quote has already been answered.");
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({
      status,
      professional_response: professionalResponse || null,
      responded_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) {
    redirectWithMessage("/dashboard/quotes", error.message);
  }

  await createWorkflowNotification(supabase, {
    recipientId: quoteRow.customer_id,
    actorId: user.id,
    title: status === "accepted" ? "Quote accepted" : "Quote declined",
    body: quoteRow.title ?? "Quote request updated",
    type: status === "accepted" ? "quote_accepted" : "quote_declined",
    data: { quoteId },
  });

  revalidatePath("/dashboard/quotes");
  redirect("/dashboard/quotes?message=Quote response saved.");
}

export async function convertQuoteToJob(formData: FormData) {
  const { supabase, user } = await requireUser();
  const quoteId = formString(formData, "quoteId");
  const scheduledStart = formString(formData, "scheduledStart") || null;
  const { data: quote, error: quoteError } = await supabase
    .from("quote_requests")
    .select("id, company_id, customer_id, title, project_details, location, status, companies(owner_id)")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) {
    redirectWithMessage("/dashboard/quotes", "Quote request not found.");
  }

  const row = quote as {
    id: string;
    company_id: string;
    customer_id: string;
    title: string;
    project_details: string;
    location?: string | null;
    status?: string | null;
    companies?: { owner_id?: string | null } | null;
  };

  if (row.companies?.owner_id !== user.id) {
    redirectWithMessage("/dashboard/quotes", "Only the company owner can convert quotes.");
  }

  if (!canConvertQuoteToJob(row.status)) {
    redirectWithMessage("/dashboard/quotes", "Only accepted quotes can become jobs.");
  }
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      company_id: row.company_id,
      customer_id: row.customer_id,
      quote_request_id: row.id,
      title: row.title,
      description: row.project_details,
      location: row.location ?? null,
      scheduled_start: scheduledStart,
      status: "pending",
    })
    .select("id")
    .single();

  if (jobError || !job) {
    redirectWithMessage(
      "/dashboard/quotes",
      jobError?.message ?? "Job could not be created.",
    );
  }

  const jobRow = job as { id: string };
  await supabase
    .from("quote_requests")
    .update({
      status: "converted_to_job",
      converted_job_id: jobRow.id,
    })
    .eq("id", row.id);

  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/jobs");
  await createWorkflowNotification(supabase, {
    recipientId: row.customer_id,
    actorId: user.id,
    title: "Job created",
    body: row.title,
    type: "job_created",
    data: { quoteId, jobId: jobRow.id },
  });
  redirect("/dashboard/jobs?message=Quote converted to job.");
}

export async function acceptJob(formData: FormData) {
  const { supabase, user } = await requireUser();
  const jobId = formString(formData, "jobId");
  const { data: job } = await supabase
    .from("jobs")
    .select("customer_id, status, title, companies(owner_id)")
    .eq("id", jobId)
    .single();
  const jobRow = job as {
    customer_id?: string | null;
    status?: string | null;
    title?: string | null;
    companies?: { owner_id?: string | null } | null;
  } | null;

  if (jobRow?.customer_id !== user.id) {
    redirectWithMessage("/dashboard/jobs", "Only the customer can accept this job.");
  }

  if (!canCustomerAcceptJob(jobRow.status)) {
    redirectWithMessage("/dashboard/jobs", "Only pending jobs can be accepted.");
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      status: "scheduled",
      customer_accepted_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    redirectWithMessage("/dashboard/jobs", error.message);
  }

  await createWorkflowNotification(supabase, {
    recipientId: jobRow.companies?.owner_id,
    actorId: user.id,
    title: "Job accepted",
    body: jobRow.title ?? "Job accepted by customer",
    type: "job_accepted",
    data: { jobId },
  });

  revalidatePath("/dashboard/jobs");
  redirect("/dashboard/jobs?message=Job accepted.");
}

export async function updateJobStatus(formData: FormData) {
  const { supabase, user } = await requireUser();
  const jobId = formString(formData, "jobId");
  const status = formString(formData, "status");
  const allowed = ["scheduled", "in_progress", "completed", "cancelled"];

  if (!allowed.includes(status) || !canProfessionalSetJobStatus(status)) {
    redirectWithMessage("/dashboard/jobs", "Invalid job status.");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("customer_id, title, companies(owner_id)")
    .eq("id", jobId)
    .single();
  const jobRow = job as {
    customer_id?: string | null;
    title?: string | null;
    companies?: { owner_id?: string | null } | null;
  } | null;

  if (jobRow?.companies?.owner_id !== user.id) {
    redirectWithMessage("/dashboard/jobs", "Only the company owner can update this job.");
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", jobId);

  if (error) {
    redirectWithMessage("/dashboard/jobs", error.message);
  }

  if (status === "completed") {
    await createWorkflowNotification(supabase, {
      recipientId: jobRow.customer_id,
      actorId: user.id,
      title: "Job completed",
      body: jobRow.title ?? "Your job was marked complete",
      type: "job_completed",
      data: { jobId },
    });
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath("/professionals/profile");
  redirect("/dashboard/jobs?message=Job status updated.");
}
