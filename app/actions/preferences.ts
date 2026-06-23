"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

function safeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function updateLanguage(formData: FormData) {
  const requestedLocale = formData.get("locale");
  const locale = isLocale(typeof requestedLocale === "string" ? requestedLocale : null)
    ? requestedLocale
    : defaultLocale;
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));
  const cookieStore = await cookies();

  cookieStore.set("vp23_locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ preferred_language: locale })
        .eq("id", user.id);
    }
  } catch {
    // Public pages can still persist language before Supabase env is configured.
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}
