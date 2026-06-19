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
      agent_run_results: {
        Row: {
          agent_id: string;
          agent_run_id: string;
          created_at: string;
          id: string;
          output: string;
          project_id: string;
          reasoning: string;
          user_id: string;
        };
        Insert: {
          agent_id: string;
          agent_run_id: string;
          created_at?: string;
          id?: string;
          output: string;
          project_id: string;
          reasoning: string;
          user_id: string;
        };
        Update: {
          agent_id?: string;
          agent_run_id?: string;
          created_at?: string;
          id?: string;
          output?: string;
          project_id?: string;
          reasoning?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_run_results_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_run_results_agent_run_id_fkey";
            columns: ["agent_run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_run_results_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_runs: {
        Row: {
          conversation_history: string;
          created_at: string;
          id: string;
          merged_output: string | null;
          project_id: string;
          result_artifact_id: string | null;
          selected_agent_ids: string[];
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          user_message: string;
        };
        Insert: {
          conversation_history?: string;
          created_at?: string;
          id?: string;
          merged_output?: string | null;
          project_id: string;
          result_artifact_id?: string | null;
          selected_agent_ids?: string[];
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          user_message: string;
        };
        Update: {
          conversation_history?: string;
          created_at?: string;
          id?: string;
          merged_output?: string | null;
          project_id?: string;
          result_artifact_id?: string | null;
          selected_agent_ids?: string[];
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          user_message?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_runs_result_artifact_id_fkey";
            columns: ["result_artifact_id"];
            isOneToOne: false;
            referencedRelation: "artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      agents: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          system_prompt: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          name: string;
          system_prompt: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          system_prompt?: string;
        };
        Relationships: [];
      };
      billing_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          payload: Json;
          processed_at: string;
          square_event_id: string;
          square_object_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          payload: Json;
          processed_at?: string;
          square_event_id: string;
          square_object_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed_at?: string;
          square_event_id?: string;
          square_object_id?: string | null;
        };
        Relationships: [];
      };
      conversation_summaries: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          message_count: number;
          project_id: string | null;
          summary: string;
          updated_at: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          message_count?: number;
          project_id?: string | null;
          summary: string;
          updated_at?: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message_count?: number;
          project_id?: string | null;
          summary?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_summaries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_summaries_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          project_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      artifact_folders: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          project_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          project_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          project_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artifact_folders_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      artifacts: {
        Row: {
          artifact_type: string;
          content: string;
          created_at: string;
          folder_id: string | null;
          id: string;
          metadata: Json;
          project_id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          artifact_type: string;
          content: string;
          created_at?: string;
          folder_id?: string | null;
          id?: string;
          metadata?: Json;
          project_id: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          artifact_type?: string;
          content?: string;
          created_at?: string;
          folder_id?: string | null;
          id?: string;
          metadata?: Json;
          project_id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artifacts_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "artifact_folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artifacts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          created_at: string;
          file_type: string;
          id: string;
          name: string;
          project_id: string;
          size_bytes: number;
          storage_path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          file_type: string;
          id?: string;
          name: string;
          project_id: string;
          size_bytes: number;
          storage_path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          file_type?: string;
          id?: string;
          name?: string;
          project_id?: string;
          size_bytes?: number;
          storage_path?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_candidates: {
        Row: {
          content: string;
          conversation_id: string | null;
          created_at: string;
          id: string;
          importance: number;
          memory_type: string;
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id?: string | null;
          created_at?: string;
          id?: string;
          importance?: number;
          memory_type?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string | null;
          created_at?: string;
          id?: string;
          importance?: number;
          memory_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_candidates_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_embeddings: {
        Row: {
          content_hash: string | null;
          created_at: string;
          embedding: Json | null;
          embedding_model: string | null;
          id: string;
          source_id: string;
          source_table: string;
          user_id: string;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string;
          embedding?: Json | null;
          embedding_model?: string | null;
          id?: string;
          source_id: string;
          source_table: string;
          user_id: string;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string;
          embedding?: Json | null;
          embedding_model?: string | null;
          id?: string;
          source_id?: string;
          source_table?: string;
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
          role: string;
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          plan: string;
          square_customer_id: string | null;
          subscription_status: string;
          subscription_tier: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          plan?: string;
          square_customer_id?: string | null;
          subscription_status?: string;
          subscription_tier?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          plan?: string;
          square_customer_id?: string | null;
          subscription_status?: string;
          subscription_tier?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_memory: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          project_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: string;
          created_at?: string;
          id?: string;
          project_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_memory_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_memories: {
        Row: {
          created_at: string;
          id: string;
          importance: number;
          project_id: string;
          summary: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          importance?: number;
          project_id: string;
          summary: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          importance?: number;
          project_id?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_memories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      research_jobs: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          query: string;
          result_artifact_id: string | null;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          query: string;
          result_artifact_id?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          query?: string;
          result_artifact_id?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_jobs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "research_jobs_result_artifact_id_fkey";
            columns: ["result_artifact_id"];
            isOneToOne: false;
            referencedRelation: "artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          metadata: Json;
          square_checkout_id: string | null;
          square_customer_id: string | null;
          square_subscription_id: string | null;
          status: string;
          tier: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          metadata?: Json;
          square_checkout_id?: string | null;
          square_customer_id?: string | null;
          square_subscription_id?: string | null;
          status?: string;
          tier?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          metadata?: Json;
          square_checkout_id?: string | null;
          square_customer_id?: string | null;
          square_subscription_id?: string | null;
          status?: string;
          tier?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          created_at: string;
          estimated_cost: number;
          id: string;
          input_tokens: number;
          model: string;
          output_tokens: number;
          provider: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          estimated_cost?: number;
          id?: string;
          input_tokens?: number;
          model: string;
          output_tokens?: number;
          provider: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          estimated_cost?: number;
          id?: string;
          input_tokens?: number;
          model?: string;
          output_tokens?: number;
          provider?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_memories: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          importance: number;
          memory_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          importance?: number;
          memory_type?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          importance?: number;
          memory_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workspace_knowledge: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_knowledge_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
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
    Functions: {
      current_user_can_edit_project_content: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      current_user_can_manage_project: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      current_user_can_read_project: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      current_user_has_team_plan: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_is_project_owner: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
      current_user_project_role: {
        Args: { target_project_id: string };
        Returns: string;
      };
      transfer_project_ownership: {
        Args: { target_project_id: string; new_owner_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
