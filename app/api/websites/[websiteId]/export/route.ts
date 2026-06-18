import { NextResponse, type NextRequest } from "next/server";
import {
  createWebsiteZip,
  pageToHtml,
  type GeneratedWebsitePage,
} from "@/lib/websites/generation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    websiteId: string;
  }>;
};

function sanitizeDownloadName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function toBody(bytes: Uint8Array) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  return arrayBuffer;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { websiteId } = await context.params;
  const format = request.nextUrl.searchParams.get("format") ?? "html";
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [{ data: website, error: websiteError }, { data: pages }] =
    await Promise.all([
      supabase
        .from("website_projects")
        .select("id,title,description")
        .eq("id", websiteId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("website_pages")
        .select("page_name,page_slug,page_content")
        .eq("website_project_id", websiteId)
        .order("created_at", { ascending: true }),
    ]);

  if (websiteError || !website) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const normalizedPages: GeneratedWebsitePage[] = (pages ?? []).map((page) => ({
    page_content: page.page_content,
    page_name: page.page_name,
    page_slug: page.page_slug,
  }));
  const fileName = sanitizeDownloadName(website.title || "orivoo-website");

  if (format === "html") {
    const firstPage = normalizedPages[0];

    if (!firstPage) {
      return NextResponse.json({ error: "No pages to export." }, { status: 422 });
    }

    return new Response(pageToHtml(firstPage, website.title), {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}.html"`,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  const exportType =
    format === "next" ? "next" : format === "static" ? "static" : "html";
  const zip = await createWebsiteZip({
    exportType,
    pages: normalizedPages,
    websiteTitle: website.title,
  });

  return new Response(toBody(zip), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}-${exportType}.zip"`,
      "Content-Type": "application/zip",
    },
  });
}
