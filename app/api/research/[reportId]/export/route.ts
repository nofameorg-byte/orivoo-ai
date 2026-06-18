import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import { NextResponse, type NextRequest } from "next/server";
import {
  getResearchSections,
  reportToPlainText,
  type GeneratedResearchSource,
} from "@/lib/research/formatting";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

function sanitizeDownloadName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function pdfBuffer(reportText: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).fillColor("#111111").text("ORIVOO Research Studio", {
      align: "left",
    });
    doc.moveDown();
    doc.fontSize(10).fillColor("#666666").text("Generated research report");
    doc.moveDown();
    doc.fontSize(11).fillColor("#111111").text(reportText, {
      lineGap: 4,
    });
    doc.end();
  });
}

async function docxBuffer({
  content,
  projectName,
  sources,
  title,
  topic,
}: {
  content: string;
  projectName: string | null;
  sources: GeneratedResearchSource[];
  title: string;
  topic: string;
}) {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(title)],
    }),
    new Paragraph(`Topic: ${topic}`),
    new Paragraph(`Project: ${projectName ?? "No project"}`),
  ];

  for (const section of getResearchSections(content)) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(section.title)],
      }),
      ...section.body.split("\n").map((line) => new Paragraph(line || " ")),
    );
  }

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Sources")],
    }),
  );

  for (const source of sources) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            bold: true,
            text: source.source_title,
          }),
        ],
      }),
      new Paragraph(source.source_url ?? "No URL"),
      new Paragraph(source.source_content ?? ""),
    );
  }

  const document = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(document));
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { reportId } = await context.params;
  const format = request.nextUrl.searchParams.get("format") ?? "txt";
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: report, error: reportError } = await supabase
    .from("research_reports")
    .select("id,title,topic,project_id,report_content,created_at")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const [{ data: sources }, { data: project }] = await Promise.all([
    supabase
      .from("research_sources")
      .select("source_title,source_url,source_type,source_content")
      .eq("report_id", report.id)
      .order("created_at", { ascending: true }),
    report.project_id
      ? supabase
          .from("projects")
          .select("name")
          .eq("id", report.project_id)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const normalizedSources = (sources ?? []).map((source) => ({
    source_content: source.source_content,
    source_title: source.source_title,
    source_type: source.source_type,
    source_url: source.source_url,
  }));
  const plainText = reportToPlainText({
    content: report.report_content,
    projectName: project?.name ?? null,
    sources: normalizedSources,
    title: report.title,
    topic: report.topic,
  });
  const fileName = sanitizeDownloadName(report.title || "orivoo-research-report");

  if (format === "pdf") {
    const buffer = await pdfBuffer(plainText);

    return new Response(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  }

  if (format === "docx") {
    const buffer = await docxBuffer({
      content: report.report_content,
      projectName: project?.name ?? null,
      sources: normalizedSources,
      title: report.title,
      topic: report.topic,
    });

    return new Response(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  }

  return new Response(plainText, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
