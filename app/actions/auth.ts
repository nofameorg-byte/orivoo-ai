"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function authRedirect(path: "/login" | "/signup", message: string) {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    authRedirect("/login", "Enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authRedirect("/login", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");
  const displayName = getFormValue(formData, "displayName");

  if (!email || !password) {
    authRedirect("/signup", "Enter your email and password.");
  }

  if (password.length < 8) {
    authRedirect("/signup", "Password must be at least 8 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    authRedirect("/signup", error.message);
  }

  revalidatePath("/", "layout");
  redirect(
    "/login?message=Account created. Check your email to confirm your ORIVOO AI workspace.",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
