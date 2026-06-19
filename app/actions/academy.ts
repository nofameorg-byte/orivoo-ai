"use server";

import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMemoryContext } from "@/lib/core/memory";
import { createNotification } from "@/lib/core/notifications";
import { parseGeneratedAcademyCourse } from "@/lib/academy/generation";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to use ORIVOO Academy.");
  }

  return { supabase, userId: user.id };
}

async function verifyProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | null,
  userId: string,
) {
  if (!projectId) return null;
  const { data: project, error } = await supabase
    .from("projects")
    .select("id,name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !project) {
    redirect("/dashboard/academy?message=Project not found.");
  }

  return project;
}

export async function generateAcademyCourse(formData: FormData) {
  const subject = formString(formData, "subject");
  const gradeLevel = formString(formData, "gradeLevel");
  const topic = formString(formData, "topic");
  const projectId = formString(formData, "projectId") || null;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!subject || !gradeLevel || !topic) {
    redirect("/dashboard/academy?message=Enter subject, grade level, and topic.");
  }

  if (!groqApiKey) {
    redirect("/dashboard/academy?message=Missing GROQ_API_KEY.");
  }

  const { supabase, userId } = await getUserContext();
  const project = await verifyProject(supabase, projectId, userId);
  const memoryContext = await getMemoryContext({ projectId, userId });
  const groq = new Groq({ apiKey: groqApiKey });
  let generated;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${memoryContext}

You are ORIVOO Academy, an education and workforce learning platform for students, parents, teachers, nonprofits, and workforce development programs. Return only valid JSON.`,
        },
        {
          role: "user",
          content: `Create a complete learning course.

Subject: ${subject}
Grade Level: ${gradeLevel}
Topic: ${topic}
Project: ${project?.name ?? "No project selected"}

Generate courses, lessons, study guides, quizzes, flashcards, and practice tests.

Return JSON exactly like:
{
  "title": "Course title",
  "description": "Course description",
  "subject": "Math",
  "grade_level": "8th Grade",
  "lessons": [
    { "title": "Lesson title", "content": "Markdown lesson with objectives, explanation, examples, study guide, practice test, and reflection" }
  ],
  "quizzes": [
    { "title": "Quiz title", "questions_json": [{ "question": "...", "choices": ["A"], "answer": "...", "explanation": "..." }] }
  ],
  "flashcards": [
    { "front_text": "Term or question", "back_text": "Answer" }
  ]
}`,
        },
      ],
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    generated = parseGeneratedAcademyCourse(
      completion.choices[0]?.message?.content ?? "",
    );
  } catch {
    redirect("/dashboard/academy?message=ORIVOO could not generate the course. Please try again.");
  }

  const { data: course, error: courseError } = await supabase
    .from("academy_courses")
    .insert({
      description: generated.description,
      grade_level: generated.grade_level || gradeLevel,
      project_id: projectId,
      subject: generated.subject || subject,
      title: generated.title,
      user_id: userId,
    })
    .select("id")
    .single();

  if (courseError || !course) {
    redirect("/dashboard/academy?message=Could not save course.");
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("academy_lessons")
    .insert(
      generated.lessons.map((lesson) => ({
        content: lesson.content,
        course_id: course.id,
        title: lesson.title,
      })),
    )
    .select("id,title");

  if (lessonsError || !lessons?.length) {
    redirect(`/dashboard/academy/${course.id}?message=Course saved but lessons could not be created.`);
  }

  await supabase.from("academy_progress").upsert(
    {
      completion_percent: 0,
      course_id: course.id,
      user_id: userId,
    },
    { onConflict: "user_id,course_id" },
  );

  await Promise.all([
    generated.quizzes.length
      ? supabase.from("academy_quizzes").insert(
          generated.quizzes.map((quiz, index) => ({
            lesson_id: lessons[Math.min(index, lessons.length - 1)].id,
            questions_json: quiz.questions_json,
            title: quiz.title,
          })),
        )
      : Promise.resolve(),
    generated.flashcards.length
      ? supabase.from("academy_flashcards").insert(
          generated.flashcards.map((card, index) => ({
            back_text: card.back_text,
            front_text: card.front_text,
            lesson_id: lessons[Math.min(index, lessons.length - 1)].id,
          })),
        )
      : Promise.resolve(),
  ]);

  await createNotification({
    body: `${generated.title} is ready in ORIVOO Academy.`,
    metadata: { courseId: course.id },
    title: "Academy course generated",
    type: "academy_generation",
    userId,
  });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/academy/${course.id}`);
}

export async function assignAcademyCourseToProject(formData: FormData) {
  const courseId = formString(formData, "courseId");
  const projectId = formString(formData, "projectId") || null;
  const { supabase, userId } = await getUserContext();

  await verifyProject(supabase, projectId, userId);

  const { error } = await supabase
    .from("academy_courses")
    .update({ project_id: projectId })
    .eq("id", courseId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/dashboard/academy/${courseId}?message=Could not update project.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/academy/${courseId}`);
}

export async function updateAcademyProgress(formData: FormData) {
  const courseId = formString(formData, "courseId");
  const completionPercent = Number(formString(formData, "completionPercent"));
  const { supabase, userId } = await getUserContext();

  await supabase.from("academy_progress").upsert(
    {
      completion_percent: Number.isFinite(completionPercent)
        ? Math.max(0, Math.min(100, completionPercent))
        : 0,
      course_id: courseId,
      user_id: userId,
    },
    { onConflict: "user_id,course_id" },
  );

  revalidatePath(`/dashboard/academy/${courseId}`);
  redirect(`/dashboard/academy/${courseId}?message=Progress updated.`);
}

export async function deleteAcademyCourse(formData: FormData) {
  const courseId = formString(formData, "courseId");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard/academy";
  const { supabase, userId } = await getUserContext();

  const { error } = await supabase
    .from("academy_courses")
    .delete()
    .eq("id", courseId)
    .eq("user_id", userId);

  if (error) {
    redirect(`${redirectTo}?message=Could not delete course.`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${redirectTo}?message=Course deleted.`);
}
