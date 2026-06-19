import type { Json } from "@/lib/database.types";

export type GeneratedLesson = {
  content: string;
  title: string;
};

export type GeneratedQuiz = {
  questions_json: Json;
  title: string;
};

export type GeneratedFlashcard = {
  back_text: string;
  front_text: string;
};

export type GeneratedAcademyCourse = {
  description: string;
  flashcards: GeneratedFlashcard[];
  grade_level: string;
  lessons: GeneratedLesson[];
  quizzes: GeneratedQuiz[];
  subject: string;
  title: string;
};

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

export function parseGeneratedAcademyCourse(text: string): GeneratedAcademyCourse {
  const parsed = JSON.parse(extractJsonObject(text)) as Partial<GeneratedAcademyCourse>;

  if (!parsed.title || !parsed.description || !Array.isArray(parsed.lessons)) {
    throw new Error("AI response missed required course fields.");
  }

  return {
    description: parsed.description,
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards.map((card) => ({
          back_text: card.back_text || "Answer pending.",
          front_text: card.front_text || "Question pending.",
        }))
      : [],
    grade_level: parsed.grade_level ?? "General",
    lessons: parsed.lessons.map((lesson) => ({
      content: lesson.content || "Lesson content pending.",
      title: lesson.title || "Lesson",
    })),
    quizzes: Array.isArray(parsed.quizzes)
      ? parsed.quizzes.map((quiz) => ({
          questions_json: quiz.questions_json ?? [],
          title: quiz.title || "Quiz",
        }))
      : [],
    subject: parsed.subject ?? "General",
    title: parsed.title,
  };
}

export function courseToMarkdown({
  course,
  flashcards,
  lessons,
  projectName,
  quizzes,
}: {
  course: {
    description: string;
    grade_level: string;
    subject: string;
    title: string;
  };
  flashcards: { back_text: string; front_text: string }[];
  lessons: { content: string; title: string }[];
  projectName: string | null;
  quizzes: { questions_json: Json; title: string }[];
}) {
  const lessonText = lessons
    .map((lesson, index) => `## Lesson ${index + 1}: ${lesson.title}\n${lesson.content}`)
    .join("\n\n");
  const quizText = quizzes
    .map(
      (quiz, index) =>
        `## Quiz ${index + 1}: ${quiz.title}\n\`\`\`json\n${JSON.stringify(
          quiz.questions_json,
          null,
          2,
        )}\n\`\`\``,
    )
    .join("\n\n");
  const flashcardText = flashcards
    .map((card, index) => `${index + 1}. **${card.front_text}**\n   ${card.back_text}`)
    .join("\n");

  return `# ${course.title}

Subject: ${course.subject}
Grade Level: ${course.grade_level}
Project: ${projectName ?? "No project"}

${course.description}

${lessonText}

# Quizzes
${quizText || "No quizzes generated yet."}

# Flashcards
${flashcardText || "No flashcards generated yet."}`;
}
