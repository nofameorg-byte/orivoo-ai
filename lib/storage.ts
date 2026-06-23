import { createClient } from "@/lib/supabase/server";

export async function signedStorageUrl(path?: string | null) {
  if (!path) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("vp23-documents")
    .createSignedUrl(path, 60 * 10);

  return data?.signedUrl ?? null;
}

export async function signedStorageUrls(paths: Array<string | null | undefined>) {
  return Promise.all(paths.map((path) => signedStorageUrl(path)));
}
