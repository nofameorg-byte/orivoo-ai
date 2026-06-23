"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function authRedirect(path: "/login" | "/signup", messageKey: string) {
  redirect(`${path}?messageKey=${encodeURIComponent(messageKey)}`);
}

export async function signIn(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    authRedirect("/login", "auth.messageEnterCredentials");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");
  const displayName = getFormValue(formData, "displayName");
  const role = getFormValue(formData, "role") || "customer";
  const requestedLocale = getFormValue(formData, "preferredLanguage");
  const preferredLanguage = isLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  if (!email || !password) {
    authRedirect("/signup", "auth.messageEnterCredentials");
  }

  if (password.length < 8) {
    authRedirect("/signup", "auth.messagePasswordLength");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
        preferred_language: preferredLanguage,
        role,
      },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/login?messageKey=auth.messageCreated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
