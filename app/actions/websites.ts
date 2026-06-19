"use server";

import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { incrementUsage } from "@/lib/billing/usage";
import { getMemoryContext } from "@/lib/core/memory";
import { createNotification } from "@/lib/core/notifications";
import { parseGeneratedWebsite } from "@/lib/websites/generation";
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
    redirect("/login?message=Login to use ORIVOO Website Builder.");
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
    redirect("/dashboard/websites?message=Project not found.");
  }

  return project;
}

export async function generateWebsite(formData: FormData) {
  const websiteName = formString(formData, "websiteName");
  const businessType = formString(formData, "businessType");
  const description = formString(formData, "description");
  const projectId = formString(formData, "projectId") || null;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!websiteName || !businessType || !description) {
    redirect("/dashboard/websites?message=Enter website name, business type, and description.");
  }

  if (!groqApiKey) {
    redirect("/dashboard/websites?message=Missing GROQ_API_KEY.");
  }

  const { supabase, userId } = await getUserContext();
  const project = await verifyProject(supabase, projectId, userId);
  const prompt = `${websiteName} | ${businessType} | ${description}`;
  const groq = new Groq({ apiKey: groqApiKey });
  const memoryContext = await getMemoryContext({ projectId, userId });
  let generated;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Website Builder. Generate complete, conversion-focused websites. Return only valid JSON.`,
        },
        {
          role: "user",
          content: `Generate a complete website for:
Website Name: ${websiteName}
Business Type: ${businessType}
Description: ${description}
Project: ${project?.name ?? "No project selected"}

Return JSON exactly like:
{
  "title": "Website title",
  "description": "Short website description",
  "prompt": "Combined generation prompt",
  "pages": [
    {
      "page_name": "Home Page",
      "page_slug": "home",
      "page_content": "Markdown content with sections for SEO Meta Title, SEO Description, Hero, Services, Call To Actions"
    }
  ]
}

Required pages: Home Page, About Page, Services Page, Contact Page, Privacy Policy, Terms Page.
Every page must include SEO Meta Title, SEO Description, strong page copy, and Call To Actions.`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.35,
    });

    generated = parseGeneratedWebsite(
      completion.choices[0]?.message?.content ?? "",
    );
  } catch {
    redirect("/dashboard/websites?message=ORIVOO could not generate the website. Please try again.");
  }

  const { data: website, error: websiteError } = await supabase
    .from("website_projects")
    .insert({
      description: generated.description,
      project_id: projectId,
      prompt,
      status: "ready",
      title: generated.title || websiteName,
      user_id: userId,
    })
    .select("id")
    .single();

  if (websiteError || !website) {
    redirect("/dashboard/websites?message=Could not save website project.");
  }

  const { error: pagesError } = await supabase.from("website_pages").insert(
    generated.pages.map((page) => ({
      page_content: page.page_content,
      page_name: page.page_name,
      page_slug: page.page_slug,
      website_project_id: website.id,
    })),
  );

  if (pagesError) {
    redirect(`/dashboard/websites/${website.id}?message=Website saved but pages could not be created.`);
  }

  await createNotification({
    body: `${generated.title} is ready in Website Builder.`,
    metadata: { websiteId: website.id },
    title: "Website generation complete",
    type: "website_generation",
    userId,
  });
  await incrementUsage({
    metric: "websites_generated",
    userId,
  });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/websites/${website.id}`);
}

export async function updateWebsitePage(formData: FormData) {
  const websiteId = formString(formData, "websiteId");
  const pageId = formString(formData, "pageId");
  const pageName = formString(formData, "pageName");
  const pageSlug = formString(formData, "pageSlug");
  const pageContent = formString(formData, "pageContent");
  const { supabase, userId } = await getUserContext();

  const { data: website } = await supabase
    .from("website_projects")
    .select("id")
    .eq("id", websiteId)
    .eq("user_id", userId)
    .single();

  if (!website) {
    redirect("/dashboard/websites?message=Website not found.");
  }

  const { error } = await supabase
    .from("website_pages")
    .update({
      page_content: pageContent,
      page_name: pageName,
      page_slug: pageSlug,
    })
    .eq("id", pageId)
    .eq("website_project_id", website.id);

  if (error) {
    redirect(`/dashboard/websites/${websiteId}?message=Could not update page.`);
  }

  revalidatePath(`/dashboard/websites/${websiteId}`);
  redirect(`/dashboard/websites/${websiteId}?message=Page updated.`);
}

export async function assignWebsiteToProject(formData: FormData) {
  const websiteId = formString(formData, "websiteId");
  const projectId = formString(formData, "projectId") || null;
  const { supabase, userId } = await getUserContext();

  await verifyProject(supabase, projectId, userId);

  const { error } = await supabase
    .from("website_projects")
    .update({ project_id: projectId })
    .eq("id", websiteId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/websites/${websiteId}?message=Could not update project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/websites/${websiteId}`);
}

export async function deleteWebsiteProject(formData: FormData) {
  const websiteId = formString(formData, "websiteId");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard/websites";
  const { supabase, userId } = await getUserContext();

  const { error } = await supabase
    .from("website_projects")
    .delete()
    .eq("id", websiteId)
    .eq("user_id", userId);

  if (error) {
    redirect(`${redirectTo}?message=Could not delete website.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${redirectTo}?message=Website deleted.`);
}
