import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to continue.");
  }

  return { supabase, user };
}

export async function requireSuperAdmin() {
  const { supabase, user } = await getAuthenticatedUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    redirect("/dashboard?message=Super admin access required.");
  }

  return { supabase, user };
}
