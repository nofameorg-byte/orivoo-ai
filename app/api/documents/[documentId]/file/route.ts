import { NextResponse, type NextRequest } from "next/server";
import { DOCUMENT_BUCKET } from "@/lib/documents/config";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { documentId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (documentError || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(document.file_path, 120);

  if (signedUrlError || !signedUrl) {
    return NextResponse.json(
      { error: "Could not create file preview URL." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
