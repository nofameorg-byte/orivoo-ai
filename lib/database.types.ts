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
      academy_courses: {
        Row: {
          created_at: string;
          description: string;
          grade_level: string;
          id: string;
          project_id: string | null;
          subject: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          grade_level: string;
          id?: string;
          project_id?: string | null;
          subject: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          grade_level?: string;
          id?: string;
          project_id?: string | null;
          subject?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      academy_flashcards: {
        Row: {
          back_text: string;
          created_at: string;
          front_text: string;
          id: string;
          lesson_id: string;
        };
        Insert: {
          back_text: string;
          created_at?: string;
          front_text: string;
          id?: string;
          lesson_id: string;
        };
        Update: {
          back_text?: string;
          created_at?: string;
          front_text?: string;
          id?: string;
          lesson_id?: string;
        };
        Relationships: [];
      };
      academy_lessons: {
        Row: {
          content: string;
          course_id: string;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          course_id: string;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          course_id?: string;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_progress: {
        Row: {
          completion_percent: number;
          course_id: string;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completion_percent?: number;
          course_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completion_percent?: number;
          course_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      academy_quizzes: {
        Row: {
          created_at: string;
          id: string;
          lesson_id: string;
          questions_json: Json;
          title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lesson_id: string;
          questions_json?: Json;
          title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lesson_id?: string;
          questions_json?: Json;
          title?: string;
        };
        Relationships: [];
      };
      code_files: {
        Row: {
          code_project_id: string;
          content: string;
          created_at: string;
          file_name: string;
          file_path: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          code_project_id: string;
          content: string;
          created_at?: string;
          file_name: string;
          file_path: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          code_project_id?: string;
          content?: string;
          created_at?: string;
          file_name?: string;
          file_path?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      code_projects: {
        Row: {
          created_at: string;
          description: string;
          framework: string;
          id: string;
          language: string;
          project_id: string | null;
          prompt: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          framework: string;
          id?: string;
          language: string;
          project_id?: string | null;
          prompt: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          framework?: string;
          id?: string;
          language?: string;
          project_id?: string | null;
          prompt?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          model: string;
          project_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          model?: string;
          project_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          model?: string;
          project_id?: string | null;
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
          project_id: string | null;
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
          project_id?: string | null;
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
          project_id?: string | null;
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
          is_super_admin: boolean;
          language: string;
          theme: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          is_super_admin?: boolean;
          language?: string;
          theme?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_super_admin?: boolean;
          language?: string;
          theme?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          status: "active" | "archived";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          status?: "active" | "archived";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          status?: "active" | "archived";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      research_reports: {
        Row: {
          created_at: string;
          id: string;
          project_id: string | null;
          report_content: string;
          title: string;
          topic: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          report_content: string;
          title: string;
          topic: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          report_content?: string;
          title?: string;
          topic?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      research_sources: {
        Row: {
          created_at: string;
          id: string;
          report_id: string;
          source_content: string | null;
          source_title: string;
          source_type: string;
          source_url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          report_id: string;
          source_content?: string | null;
          source_title: string;
          source_type?: string;
          source_url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          report_id?: string;
          source_content?: string | null;
          source_title?: string;
          source_type?: string;
          source_url?: string | null;
        };
        Relationships: [];
      };
      website_pages: {
        Row: {
          created_at: string;
          id: string;
          page_content: string;
          page_name: string;
          page_slug: string;
          updated_at: string;
          website_project_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          page_content: string;
          page_name: string;
          page_slug: string;
          updated_at?: string;
          website_project_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          page_content?: string;
          page_name?: string;
          page_slug?: string;
          updated_at?: string;
          website_project_id?: string;
        };
        Relationships: [];
      };
      website_projects: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          project_id: string | null;
          prompt: string;
          status: "draft" | "generating" | "ready" | "failed";
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          project_id?: string | null;
          prompt: string;
          status?: "draft" | "generating" | "ready" | "failed";
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          project_id?: string | null;
          prompt?: string;
          status?: "draft" | "generating" | "ready" | "failed";
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      assistant_preferences: {
        Row: {
          created_at: string;
          custom_instructions: string | null;
          id: string;
          industry: string | null;
          language: string;
          memory_enabled: boolean;
          tone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          custom_instructions?: string | null;
          id?: string;
          industry?: string | null;
          language?: string;
          memory_enabled?: boolean;
          tone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          custom_instructions?: string | null;
          id?: string;
          industry?: string | null;
          language?: string;
          memory_enabled?: boolean;
          tone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          admin_announcements: boolean;
          code_generation: boolean;
          created_at: string;
          document_processing: boolean;
          id: string;
          in_app_enabled: boolean;
          research_completion: boolean;
          updated_at: string;
          user_id: string;
          website_generation: boolean;
        };
        Insert: {
          admin_announcements?: boolean;
          code_generation?: boolean;
          created_at?: string;
          document_processing?: boolean;
          id?: string;
          in_app_enabled?: boolean;
          research_completion?: boolean;
          updated_at?: string;
          user_id: string;
          website_generation?: boolean;
        };
        Update: {
          admin_announcements?: boolean;
          code_generation?: boolean;
          created_at?: string;
          document_processing?: boolean;
          id?: string;
          in_app_enabled?: boolean;
          research_completion?: boolean;
          updated_at?: string;
          user_id?: string;
          website_generation?: boolean;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          metadata: Json;
          notification_type: string;
          title: string;
          user_id: string | null;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          metadata?: Json;
          notification_type?: string;
          title: string;
          user_id?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          metadata?: Json;
          notification_type?: string;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      project_memories: {
        Row: {
          created_at: string;
          id: string;
          memory_key: string;
          memory_value: string;
          project_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          memory_key: string;
          memory_value: string;
          project_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          memory_key?: string;
          memory_value?: string;
          project_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_memories: {
        Row: {
          created_at: string;
          id: string;
          memory_key: string;
          memory_value: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          memory_key: string;
          memory_value: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          memory_key?: string;
          memory_value?: string;
          updated_at?: string;
          user_id?: string;
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
