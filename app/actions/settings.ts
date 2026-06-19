"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/core/notifications";
import { isLocale } from "@/lib/i18n/config";
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
    redirect("/login?message=Login to manage settings.");
  }

  return { supabase, user };
}

export async function updateLanguage(formData: FormData) {
  const language = formString(formData, "language");

  if (!isLocale(language)) {
    redirect("/dashboard/settings?message=Unsupported language.");
  }

  const { supabase, user } = await getUserContext();

  await Promise.all([
    supabase.from("profiles").update({ language }).eq("id", user.id),
    supabase
      .from("assistant_preferences")
      .upsert({ language, user_id: user.id }, { onConflict: "user_id" }),
  ]);

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings?message=Language updated.");
}

export async function updateUserSettings(formData: FormData) {
  const displayName = formString(formData, "displayName");
  const language = formString(formData, "language");
  const theme = formString(formData, "theme") || "dark";
  const tone = formString(formData, "tone") || "professional";
  const industry = formString(formData, "industry") || null;
  const customInstructions = formString(formData, "customInstructions") || null;
  const memoryEnabled = formData.get("memoryEnabled") === "on";
  const { supabase, user } = await getUserContext();
  const safeLanguage = isLocale(language) ? language : "en";

  await Promise.all([
    supabase
      .from("profiles")
      .update({
        display_name: displayName || user.email?.split("@")[0] || "Operator",
        language: safeLanguage,
        theme,
      })
      .eq("id", user.id),
    supabase.from("assistant_preferences").upsert(
      {
        custom_instructions: customInstructions,
        industry,
        language: safeLanguage,
        memory_enabled: memoryEnabled,
        tone,
        user_id: user.id,
      },
      { onConflict: "user_id" },
    ),
  ]);

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings?message=Settings saved.");
}

export async function updateNotificationPreferences(formData: FormData) {
  const { supabase, user } = await getUserContext();

  await supabase.from("notification_preferences").upsert(
    {
      admin_announcements: formData.get("adminAnnouncements") === "on",
      code_generation: formData.get("codeGeneration") === "on",
      document_processing: formData.get("documentProcessing") === "on",
      in_app_enabled: formData.get("inAppEnabled") === "on",
      research_completion: formData.get("researchCompletion") === "on",
      user_id: user.id,
      website_generation: formData.get("websiteGeneration") === "on",
    },
    { onConflict: "user_id" },
  );

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=Notification preferences saved.");
}

export async function saveUserMemory(formData: FormData) {
  const memoryKey = formString(formData, "memoryKey");
  const memoryValue = formString(formData, "memoryValue");
  const { supabase, user } = await getUserContext();

  if (!memoryKey || !memoryValue) {
    redirect("/dashboard/settings?message=Memory key and value are required.");
  }

  await supabase.from("user_memories").upsert(
    {
      memory_key: memoryKey,
      memory_value: memoryValue,
      user_id: user.id,
    },
    { onConflict: "user_id,memory_key" },
  );

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=Memory saved.");
}

export async function markNotificationsRead() {
  const { supabase, user } = await getUserContext();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/dashboard", "layout");
}

export async function createAdminAnnouncement(formData: FormData) {
  const title = formString(formData, "title");
  const body = formString(formData, "body");
  const { supabase, user } = await getUserContext();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    redirect("/dashboard?message=Super admin access required.");
  }

  if (!title || !body) {
    redirect("/dashboard/admin?message=Announcement title and body are required.");
  }

  await createNotification({
    body,
    title,
    type: "admin_announcement",
    userId: null,
  });

  redirect("/dashboard/admin?message=Announcement created.");
}
