export const DOCUMENT_BUCKET = "orivoo-documents";
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
} as const;

export type DocumentFileType =
  (typeof ALLOWED_DOCUMENT_TYPES)[keyof typeof ALLOWED_DOCUMENT_TYPES];

export type DocumentAction = "summarize" | "question" | "facts" | "timeline";

export const DOCUMENT_ACTION_LABELS: Record<DocumentAction, string> = {
  summarize: "Summarize",
  question: "Ask a question",
  facts: "Extract key facts",
  timeline: "Generate timeline",
};

export const DOCUMENT_ACTION_PROMPTS: Record<DocumentAction, string> = {
  summarize:
    "Summarize this document for a busy operator. Include a short executive summary, major themes, notable details, and recommended next steps.",
  question:
    "Answer the user's question using only the document context. If the answer is not present, say what is missing and suggest what to inspect next.",
  facts:
    "Extract the key facts from this document. Group them by topic and include names, dates, amounts, places, obligations, claims, and decisions where present.",
  timeline:
    "Generate a chronological timeline from this document. Include explicit dates, inferred sequencing, actors, events, and unresolved gaps.",
};
