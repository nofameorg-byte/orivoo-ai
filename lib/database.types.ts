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
      business_profiles: {
        Row: {
          address_line1: string | null;
          city: string | null;
          created_at: string;
          ein_last4: string | null;
          email: string | null;
          entity_type: string;
          id: string;
          industry: string | null;
          legal_name: string;
          owner_id: string;
          phone: string | null;
          postal_code: string | null;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          address_line1?: string | null;
          city?: string | null;
          created_at?: string;
          ein_last4?: string | null;
          email?: string | null;
          entity_type: string;
          id?: string;
          industry?: string | null;
          legal_name: string;
          owner_id: string;
          phone?: string | null;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          address_line1?: string | null;
          city?: string | null;
          created_at?: string;
          ein_last4?: string | null;
          email?: string | null;
          entity_type?: string;
          id?: string;
          industry?: string | null;
          legal_name?: string;
          owner_id?: string;
          phone?: string | null;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          amount_cents: number;
          created_at: string;
          customer_email: string;
          customer_id: string | null;
          customer_name: string;
          due_date: string;
          id: string;
          job_description: string;
          owner_id: string;
          status: "draft" | "sent" | "paid" | "void";
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          customer_email: string;
          customer_id?: string | null;
          customer_name: string;
          due_date: string;
          id?: string;
          job_description: string;
          owner_id: string;
          status?: "draft" | "sent" | "paid" | "void";
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          customer_email?: string;
          customer_id?: string | null;
          customer_name?: string;
          due_date?: string;
          id?: string;
          job_description?: string;
          owner_id?: string;
          status?: "draft" | "sent" | "paid" | "void";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
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
