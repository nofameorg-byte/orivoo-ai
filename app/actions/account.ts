"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function settingsRedirect(message: string) {
  redirect(`/dashboard/settings/legal?message=${encodeURIComponent(message)}`);
}

export async function signOutAllSessions() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });

  revalidatePath("/", "layout");
  redirect("/");
}

export async function softDeleteAccount(formData: FormData) {
  const confirmation = formData.get("confirmation");

  if (confirmation !== "DELETE") {
    settingsRedirect("Type DELETE to confirm account deletion.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage your VP23 account.");
  }

  const deletedAt = new Date().toISOString();

  await supabase
    .from("profiles")
    .update({
      avatar_url: null,
      deleted_at: deletedAt,
      display_name: "Deleted VP23 user",
    })
    .eq("id", user.id);

  await supabase
    .from("workspaces")
    .update({
      name: "Deleted VP23 workspace",
      deleted_at: deletedAt,
    })
    .eq("owner_id", user.id);

  // Compliance/KYB, document metadata, invoices, and review records are
  // intentionally retained where legally required.
  await supabase.auth.signOut({ scope: "global" });

  revalidatePath("/", "layout");
  redirect("/");
}
