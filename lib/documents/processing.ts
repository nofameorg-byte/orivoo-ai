import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import type { DocumentFileType } from "@/lib/documents/config";

const CHUNK_SIZE = 3200;
const CHUNK_OVERLAP = 300;

export function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return cleaned || "document";
}

export function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: DocumentFileType,
  fileName: string,
) {
  if (fileType === "pdf") {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return normalizeText(result.text);
    } finally {
      await parser.destroy();
    }
  }

  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value);
  }

  return normalizeText(
    `Image uploaded: ${fileName}. Use the document viewer for visual inspection. Vision-capable document actions can analyze the image directly when Groq vision is configured.`,
  );
}

export function chunkText(text: string) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end).trim());

    if (end === normalized.length) {
      break;
    }

    start = Math.max(0, end - CHUNK_OVERLAP);
  }

  return chunks.filter(Boolean);
}

export function buildDocumentContext(chunks: { content: string }[]) {
  return chunks
    .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
    .join("\n\n");
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
}
