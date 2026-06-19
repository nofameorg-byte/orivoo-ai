import Groq from "groq-sdk";
import { NextResponse, type NextRequest } from "next/server";
import { ACADEMY_ACTIONS, type AcademyAction } from "@/lib/academy/config";
import { getMemoryContext } from "@/lib/core/memory";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

type ActionBody = {
  action?: AcademyAction;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isAcademyAction(action: string | undefined): action is AcademyAction {
  return Boolean(action && action in ACADEMY_ACTIONS);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return jsonError("Missing GROQ_API_KEY environment variable.", 500);
  }

  const { courseId } = await context.params;
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

  if (!isAcademyAction(body.action)) {
    return jsonError("Choose a valid Academy action.");
  }

  const [{ data: course, error: courseError }, { data: lessons }] =
    await Promise.all([
      supabase
        .from("academy_courses")
        .select("id,title,description,subject,grade_level,project_id")
        .eq("id", courseId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("academy_lessons")
        .select("id,title,content")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true }),
    ]);

  if (courseError || !course) {
    return jsonError("Course not found.", 404);
  }

  const memoryContext = await getMemoryContext({
    projectId: course.project_id,
    userId: user.id,
  });
  const action = ACADEMY_ACTIONS[body.action];
  const lessonContext = (lessons ?? [])
    .map((lesson) => `# ${lesson.title}\n${lesson.content}`)
    .join("\n\n");
  const groq = new Groq({ apiKey: groqApiKey });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Academy. Create accessible, age-appropriate, multilingual education content for students, parents, teachers, nonprofits, and workforce development programs.`,
        },
        {
          role: "user",
          content: `${action.prompt}

Course: ${course.title}
Subject: ${course.subject}
Grade Level: ${course.grade_level}
Description: ${course.description}

Existing lessons:
${lessonContext}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    const content =
      completion.choices[0]?.message?.content?.trim() ??
      "ORIVOO Academy could not generate this content.";

    if (body.action === "quiz") {
      const lessonId = lessons?.[0]?.id;
      if (!lessonId) return jsonError("Create a lesson before generating a quiz.", 422);
      await supabase.from("academy_quizzes").insert({
        lesson_id: lessonId,
        questions_json: [{ generated: content }],
        title: action.label,
      });
    } else if (body.action === "flashcards") {
      const lessonId = lessons?.[0]?.id;
      if (!lessonId) return jsonError("Create a lesson before generating flashcards.", 422);
      await supabase.from("academy_flashcards").insert({
        back_text: content,
        front_text: "Generated flashcard set",
        lesson_id: lessonId,
      });
    } else {
      await supabase.from("academy_lessons").insert({
        content,
        course_id: course.id,
        title: action.label,
      });
    }

    return NextResponse.json({ message: `${action.label} complete.` });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "ORIVOO Academy could not complete this action.",
      500,
    );
  }
}
