export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string;
          id: string;
          model: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          model?: string;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          model?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      document_chunks: {
        Row: {
          content: string;
          created_at: string;
          document_id: string;
          id: string;
          metadata: Json;
          chunk_index: number;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          document_id: string;
          id?: string;
          metadata?: Json;
          chunk_index: number;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          document_id?: string;
          id?: string;
          metadata?: Json;
          chunk_index?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          created_at: string;
          error_message: string | null;
          extracted_text_preview: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: "pdf" | "docx" | "image";
          id: string;
          mime_type: string;
          status: "processing" | "ready" | "failed";
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          extracted_text_preview?: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: "pdf" | "docx" | "image";
          id?: string;
          mime_type: string;
          status?: "processing" | "ready" | "failed";
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          extracted_text_preview?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: "pdf" | "docx" | "image";
          id?: string;
          mime_type?: string;
          status?: "processing" | "ready" | "failed";
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: "system" | "user" | "assistant";
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: "system" | "user" | "assistant";
          user_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: "system" | "user" | "assistant";
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
