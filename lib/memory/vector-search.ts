import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

export type VectorSearchInput = {
  userId: string;
  query: string;
  workspaceId?: string | null;
  projectId?: string | null;
  limit?: number;
};

export type VectorSearchResult = {
  sourceTable: string;
  sourceId: string;
  content: string;
  similarity: number | null;
};

export async function prepareEmbeddingRecord(
  _supabase: Supabase,
  _input: {
    userId: string;
    sourceTable: string;
    sourceId: string;
    content: string;
  },
) {
  // Placeholder for future embedding generation and pgvector persistence.
  return {
    enabled: false,
    reason: "Semantic memory search is not enabled yet.",
  };
}

export async function searchMemoryVectors(
  _supabase: Supabase,
  _input: VectorSearchInput,
): Promise<VectorSearchResult[]> {
  // Future implementation will query memory_embeddings with pgvector.
  return [];
}
