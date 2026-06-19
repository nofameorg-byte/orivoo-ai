import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import { NextResponse, type NextRequest } from "next/server";
import { courseToMarkdown } from "@/lib/academy/generation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

function sanitizeDownloadName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function toBody(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  return arrayBuffer;
}

function pdfBuffer(title: string, text: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(18).text(title);
    doc.moveDown();
    doc.fontSize(11).text(text, { lineGap: 4 });
    doc.end();
  });
}

async function docxBuffer(text: string) {
  const document = new Document({
    sections: [
      {
        children: text.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun(line || " ")],
              heading: line.startsWith("# ") ? HeadingLevel.HEADING_1 : undefined,
            }),
        ),
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(document));
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { courseId } = await context.params;
  const format = request.nextUrl.searchParams.get("format") ?? "pdf";
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: course, error: courseError } = await supabase
    .from("academy_courses")
    .select("id,title,description,subject,grade_level,project_id")
    .eq("id", courseId)
    .eq("user_id", user.id)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const { data: lessons } = await supabase
    .from("academy_lessons")
    .select("id,title,content")
    .eq("course_id", course.id)
    .order("created_at", { ascending: true });
  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  const [{ data: quizzes }, { data: flashcards }, { data: project }] =
    await Promise.all([
      lessonIds.length
        ? supabase
            .from("academy_quizzes")
            .select("title,questions_json")
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [] }),
      lessonIds.length
        ? supabase
            .from("academy_flashcards")
            .select("front_text,back_text")
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [] }),
      course.project_id
        ? supabase
            .from("projects")
            .select("name")
            .eq("id", course.project_id)
            .eq("user_id", user.id)
            .single()
        : Promise.resolve({ data: null }),
    ]);

  const text = courseToMarkdown({
    course,
    flashcards: flashcards ?? [],
    lessons: lessons ?? [],
    projectName: project?.name ?? null,
    quizzes: quizzes ?? [],
  });
  const fileName = sanitizeDownloadName(course.title || "orivoo-academy-course");

  if (format === "docx") {
    const buffer = await docxBuffer(text);
    return new Response(toBody(buffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  }

  const buffer = await pdfBuffer(course.title, text);
  return new Response(toBody(buffer), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
