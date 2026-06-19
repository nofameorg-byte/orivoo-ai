export type AcademyAction =
  | "lesson"
  | "quiz"
  | "flashcards"
  | "study-guide"
  | "homework"
  | "parent-summary"
  | "teacher-guide";

export const ACADEMY_ACTIONS: Record<
  AcademyAction,
  {
    label: string;
    prompt: string;
  }
> = {
  flashcards: {
    label: "Generate Flashcards",
    prompt:
      "Generate concise flashcards that reinforce vocabulary, concepts, formulas, dates, and key ideas.",
  },
  homework: {
    label: "Generate Homework",
    prompt:
      "Generate homework with practice questions, short-answer prompts, and an extension activity.",
  },
  lesson: {
    label: "Generate Lesson",
    prompt:
      "Generate an additional structured lesson with objectives, explanation, examples, practice, and reflection.",
  },
  "parent-summary": {
    label: "Generate Parent Summary",
    prompt:
      "Generate a parent-friendly summary explaining what students are learning and how families can support practice.",
  },
  quiz: {
    label: "Generate Quiz",
    prompt:
      "Generate a quiz with multiple-choice and short-answer questions, answers, and explanations.",
  },
  "study-guide": {
    label: "Generate Study Guide",
    prompt:
      "Generate a study guide with key concepts, definitions, examples, practice prompts, and review checklist.",
  },
  "teacher-guide": {
    label: "Generate Teacher Guide",
    prompt:
      "Generate a teacher guide with objectives, materials, pacing, differentiation, and assessment ideas.",
  },
};
