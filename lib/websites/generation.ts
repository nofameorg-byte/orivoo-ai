import JSZip from "jszip";
import { REQUIRED_WEBSITE_PAGES } from "@/lib/websites/config";

export type GeneratedWebsitePage = {
  page_content: string;
  page_name: string;
  page_slug: string;
};

export type GeneratedWebsite = {
  description: string;
  pages: GeneratedWebsitePage[];
  prompt: string;
  title: string;
};

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "page";
}

export function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include structured JSON.");
  }

  return candidate.slice(start, end + 1);
}

export function parseGeneratedWebsite(text: string): GeneratedWebsite {
  const parsed = JSON.parse(extractJsonObject(text)) as Partial<GeneratedWebsite>;

  if (!parsed.title || !parsed.description || !Array.isArray(parsed.pages)) {
    throw new Error("AI response missed required website fields.");
  }

  const pages = parsed.pages.map((page) => ({
    page_content: page.page_content || "",
    page_name: page.page_name || "Page",
    page_slug: slugify(page.page_slug || page.page_name || "page"),
  }));

  for (const pageName of REQUIRED_WEBSITE_PAGES) {
    if (!pages.some((page) => page.page_name === pageName)) {
      pages.push({
        page_content: fallbackPageContent(pageName, parsed.title),
        page_name: pageName,
        page_slug: slugify(pageName),
      });
    }
  }

  return {
    description: parsed.description,
    pages,
    prompt: parsed.prompt ?? "",
    title: parsed.title,
  };
}

export function fallbackPageContent(pageName: string, title = "Generated Website") {
  return `# ${pageName}\n\n## SEO Meta Title\n${title} | ${pageName}\n\n## SEO Description\nLearn more about ${title}.\n\n## Page Copy\nThis page is ready for editing in ORIVOO Website Builder.\n\n## Call To Actions\n- Contact us\n- Learn more`;
}

export function pageToHtml(page: GeneratedWebsitePage, websiteTitle: string) {
  const escapedTitle = escapeHtml(`${websiteTitle} - ${page.page_name}`);
  const body = markdownLikeToHtml(page.page_content);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle}</title>
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; font-family: Arial, sans-serif; background: #050505; color: #fbfaf7; }
      main { max-width: 960px; margin: 0 auto; padding: 64px 24px; }
      h1, h2, h3 { color: #fff; }
      h1 { font-size: 48px; line-height: 1; }
      h2 { margin-top: 36px; color: #f3d47a; }
      p, li { color: #c8c2b5; line-height: 1.7; }
      a, .gold { color: #d8b45a; }
      .card { border: 1px solid rgba(216, 180, 90, .22); border-radius: 28px; padding: 28px; background: rgba(255,255,255,.04); }
    </style>
  </head>
  <body>
    <main>
      <div class="card">${body}</div>
    </main>
  </body>
</html>`;
}

export async function createWebsiteZip({
  exportType,
  pages,
  websiteTitle,
}: {
  exportType: "html" | "next" | "static";
  pages: GeneratedWebsitePage[];
  websiteTitle: string;
}) {
  const zip = new JSZip();

  if (exportType === "next") {
    zip.file(
      "package.json",
      JSON.stringify(
        {
          private: true,
          scripts: {
            build: "next build",
            dev: "next dev",
            start: "next start",
          },
          dependencies: {
            next: "latest",
            react: "latest",
            "react-dom": "latest",
          },
        },
        null,
        2,
      ),
    );
    zip.file(
      "app/layout.tsx",
      `import "./globals.css";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>;\n}\n`,
    );
    zip.file(
      "app/globals.css",
      "body{margin:0;background:#050505;color:#fbfaf7;font-family:Arial,sans-serif}main{max-width:960px;margin:0 auto;padding:64px 24px}h2{color:#d8b45a}p,li{color:#c8c2b5;line-height:1.7}",
    );
    zip.file("app/page.tsx", pageComponent(pages[0], websiteTitle));

    for (const page of pages.slice(1)) {
      zip.file(`app/${page.page_slug}/page.tsx`, pageComponent(page, websiteTitle));
    }

    return zip.generateAsync({ type: "uint8array" });
  }

  for (const page of pages) {
    zip.file(`${page.page_slug || "index"}.html`, pageToHtml(page, websiteTitle));
  }

  if (exportType === "static") {
    zip.file(
      "README.md",
      `# ${websiteTitle}\n\nStatic website exported from ORIVOO Website Builder.\nOpen the HTML files directly or deploy them to any static host.`,
    );
  }

  return zip.generateAsync({ type: "uint8array" });
}

function pageComponent(page: GeneratedWebsitePage, websiteTitle: string) {
  return `export default function Page() {\n  return <main><article>${jsxFromText(
    page.page_content,
  )}</article></main>;\n}\n\nexport const metadata = { title: ${JSON.stringify(
    `${websiteTitle} - ${page.page_name}`,
  )} };\n`;
}

function jsxFromText(text: string) {
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("# ")) {
        return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      }

      if (line.startsWith("## ")) {
        return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      }

      if (line.startsWith("- ")) {
        return `<p>• ${escapeHtml(line.slice(2))}</p>`;
      }

      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
}

function markdownLikeToHtml(text: string) {
  return jsxFromText(text);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
