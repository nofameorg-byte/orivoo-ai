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
