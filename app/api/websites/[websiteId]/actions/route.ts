import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import {
  WEBSITE_ACTIONS,
  type WebsiteAction,
} from "@/lib/websites/config";
import { getMemoryContext } from "@/lib/core/memory";
import {
  parseGeneratedWebsite,
  slugify,
  type GeneratedWebsitePage,
} from "@/lib/websites/generation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    websiteId: string;
  }>;
};

type ActionBody = {
  action?: WebsiteAction;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isWebsiteAction(action: string | undefined): action is WebsiteAction {
  return Boolean(action && action in WEBSITE_ACTIONS);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  const { websiteId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Authentication required.", 401);
  }

  let body: ActionBody;

  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return jsonError("Invalid JSON body.");
  }

  if (!isWebsiteAction(body.action)) {
    return jsonError("Choose a valid website action.");
  }

  const [{ data: website, error: websiteError }, { data: pages }] =
    await Promise.all([
      supabase
        .from("website_projects")
        .select("id,title,description,prompt,project_id")
        .eq("id", websiteId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("website_pages")
        .select("id,page_name,page_slug,page_content")
        .eq("website_project_id", websiteId)
        .order("created_at", { ascending: true }),
    ]);

  if (websiteError || !website) {
    return jsonError("Website not found.", 404);
  }

  const action = WEBSITE_ACTIONS[body.action];
  const memoryContext = await getMemoryContext({
    projectId: website.project_id,
    userId: user.id,
  });
  const existingPages = (pages ?? [])
    .map((page) => `# ${page.page_name}\n${page.page_content}`)
    .join("\n\n");
  const groq = new Groq({ apiKey: groqApiKey });

  try {
    if (body.action === "blog" || body.action === "marketing" || body.action === "social") {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `${memoryContext}

You are ORIVOO Website Builder. Generate concise, actionable website planning content in markdown.`,
          },
          {
            role: "user",
            content: `${action.prompt}

Website: ${website.title}
Description: ${website.description}
Prompt: ${website.prompt}

Existing pages:
${existingPages}`,
          },
        ],
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.35,
      });

      const content =
        completion.choices[0]?.message?.content?.trim() ??
        "ORIVOO could not generate this website action.";
      const pageName = action.label.replace("Generate ", "");
      const pageSlug = slugify(pageName);
      const generatedPage: GeneratedWebsitePage = {
        page_content: content,
        page_name: pageName,
        page_slug: pageSlug,
      };

      await supabase.from("website_pages").upsert(
        {
          page_content: generatedPage.page_content,
          page_name: generatedPage.page_name,
          page_slug: generatedPage.page_slug,
          website_project_id: website.id,
        },
        { onConflict: "website_project_id,page_slug" },
      );

      return NextResponse.json({
        message: `${pageName} generated.`,
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Website Builder. Return only valid JSON for a complete website.`,
        },
        {
          role: "user",
          content: `${action.prompt}

Website: ${website.title}
Description: ${website.description}
Original prompt: ${website.prompt}

Existing pages:
${existingPages}

Return JSON exactly like:
{
  "title": "Website title",
  "description": "Short website description",
  "prompt": "Updated prompt",
  "pages": [
    { "page_name": "Home Page", "page_slug": "home", "page_content": "Markdown page content with SEO Meta Title, SEO Description, Call To Actions" }
  ]
}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.35,
    });

    const generated = parseGeneratedWebsite(
      completion.choices[0]?.message?.content ?? "",
    );

    await supabase
      .from("website_projects")
      .update({
        description: generated.description,
        prompt: generated.prompt || website.prompt,
        status: "ready",
        title: generated.title,
      })
      .eq("id", website.id);

    await supabase.from("website_pages").delete().eq("website_project_id", website.id);
    await supabase.from("website_pages").insert(
      generated.pages.map((page) => ({
        page_content: page.page_content,
        page_name: page.page_name,
        page_slug: page.page_slug,
        website_project_id: website.id,
      })),
    );

    return NextResponse.json({
      message: `${action.label} complete.`,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "ORIVOO Website Builder could not complete this action.",
      500,
    );
  }
}
