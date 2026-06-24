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
      admin_review_notes: {
        Row: {
          admin_id: string;
          application_id: string | null;
          created_at: string;
          document_id: string | null;
          id: string;
          note: string;
          note_type: "internal" | "more_info_request" | "decision" | "risk";
        };
        Insert: {
          admin_id: string;
          application_id?: string | null;
          created_at?: string;
          document_id?: string | null;
          id?: string;
          note: string;
          note_type?: "internal" | "more_info_request" | "decision" | "risk";
        };
        Update: {
          admin_id?: string;
          application_id?: string | null;
          created_at?: string;
          document_id?: string | null;
          id?: string;
          note?: string;
          note_type?: "internal" | "more_info_request" | "decision" | "risk";
        };
        Relationships: [
          {
            foreignKeyName: "admin_review_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "kyb_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_review_notes_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "business_documents";
            referencedColumns: ["id"];
          },
        ];
      };
      application_status_events: {
        Row: {
          application_id: string;
          created_at: string;
          created_by: string | null;
          from_status: string | null;
          id: string;
          message: string | null;
          owner_id: string;
          to_status: string;
        };
        Insert: {
          application_id: string;
          created_at?: string;
          created_by?: string | null;
          from_status?: string | null;
          id?: string;
          message?: string | null;
          owner_id: string;
          to_status: string;
        };
        Update: {
          application_id?: string;
          created_at?: string;
          created_by?: string | null;
          from_status?: string | null;
          id?: string;
          message?: string | null;
          owner_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "kyb_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          actor_id: string | null;
          business_profile_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          event_type:
            | "user_login"
            | "document_upload"
            | "application_submission"
            | "invoice_creation"
            | "customer_creation"
            | "admin_review_action";
          id: string;
          ip_address: string | null;
          metadata: Json;
          user_agent: string | null;
        };
        Insert: {
          actor_id?: string | null;
          business_profile_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_type:
            | "user_login"
            | "document_upload"
            | "application_submission"
            | "invoice_creation"
            | "customer_creation"
            | "admin_review_action";
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          user_agent?: string | null;
        };
        Update: {
          actor_id?: string | null;
          business_profile_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_type?:
            | "user_login"
            | "document_upload"
            | "application_submission"
            | "invoice_creation"
            | "customer_creation"
            | "admin_review_action";
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_profile_id_fkey";
            columns: ["business_profile_id"];
            isOneToOne: false;
            referencedRelation: "business_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      beneficial_owners: {
        Row: {
          address: string;
          application_id: string;
          created_at: string;
          date_of_birth: string;
          full_name: string;
          id: string;
          owner_id: string;
          ownership_percentage: number;
          ssn_last4: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          application_id: string;
          created_at?: string;
          date_of_birth: string;
          full_name: string;
          id?: string;
          owner_id: string;
          ownership_percentage: number;
          ssn_last4?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          application_id?: string;
          created_at?: string;
          date_of_birth?: string;
          full_name?: string;
          id?: string;
          owner_id?: string;
          ownership_percentage?: number;
          ssn_last4?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "beneficial_owners_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "kyb_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      business_documents: {
        Row: {
          application_id: string | null;
          category:
            | "EIN letter"
            | "Articles of Organization"
            | "Operating Agreement"
            | "Beneficial Owner ID"
            | "Proof of Address"
            | "Bank Statement"
            | "Business License"
            | "Other";
          created_at: string;
          file_name: string;
          file_size: number;
          id: string;
          mime_type: "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";
          owner_id: string;
          storage_path: string;
          updated_at: string;
          verification_status: "unverified" | "verified" | "rejected";
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          application_id?: string | null;
          category:
            | "EIN letter"
            | "Articles of Organization"
            | "Operating Agreement"
            | "Beneficial Owner ID"
            | "Proof of Address"
            | "Bank Statement"
            | "Business License"
            | "Other";
          created_at?: string;
          file_name: string;
          file_size: number;
          id?: string;
          mime_type: "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";
          owner_id: string;
          storage_path: string;
          updated_at?: string;
          verification_status?: "unverified" | "verified" | "rejected";
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          application_id?: string | null;
          category?:
            | "EIN letter"
            | "Articles of Organization"
            | "Operating Agreement"
            | "Beneficial Owner ID"
            | "Proof of Address"
            | "Bank Statement"
            | "Business License"
            | "Other";
          created_at?: string;
          file_name?: string;
          file_size?: number;
          id?: string;
          mime_type?: "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";
          owner_id?: string;
          storage_path?: string;
          updated_at?: string;
          verification_status?: "unverified" | "verified" | "rejected";
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "business_documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "kyb_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      business_invitations: {
        Row: {
          accepted_at: string | null;
          business_profile_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role_id: string;
          status: "pending" | "accepted" | "revoked" | "expired";
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          business_profile_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role_id: string;
          status?: "pending" | "accepted" | "revoked" | "expired";
          token?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          business_profile_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role_id?: string;
          status?: "pending" | "accepted" | "revoked" | "expired";
          token?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_members: {
        Row: {
          business_profile_id: string;
          created_at: string;
          id: string;
          invited_by: string | null;
          role_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          business_profile_id: string;
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          role_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          business_profile_id?: string;
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          role_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
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
      business_roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: "owner" | "admin" | "viewer";
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: "owner" | "admin" | "viewer";
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: "owner" | "admin" | "viewer";
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
      kyb_applications: {
        Row: {
          business_address: string | null;
          business_type: string | null;
          certification_accepted: boolean;
          contact_email: string | null;
          created_at: string;
          dba_name: string | null;
          ein: string | null;
          expected_average_transaction_size: number | null;
          expected_monthly_transaction_volume: number | null;
          formation_state: string | null;
          id: string;
          industry: string | null;
          intended_use_of_account: string | null;
          legal_business_name: string;
          mailing_address: string | null;
          owner_id: string;
          phone_number: string | null;
          reviewed_at: string | null;
          source_of_funds: string | null;
          status:
            | "draft"
            | "submitted"
            | "under_review"
            | "more_info_needed"
            | "approved"
            | "rejected"
            | "partner_review";
          submitted_at: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          business_address?: string | null;
          business_type?: string | null;
          certification_accepted?: boolean;
          contact_email?: string | null;
          created_at?: string;
          dba_name?: string | null;
          ein?: string | null;
          expected_average_transaction_size?: number | null;
          expected_monthly_transaction_volume?: number | null;
          formation_state?: string | null;
          id?: string;
          industry?: string | null;
          intended_use_of_account?: string | null;
          legal_business_name?: string;
          mailing_address?: string | null;
          owner_id: string;
          phone_number?: string | null;
          reviewed_at?: string | null;
          source_of_funds?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "more_info_needed"
            | "approved"
            | "rejected"
            | "partner_review";
          submitted_at?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          business_address?: string | null;
          business_type?: string | null;
          certification_accepted?: boolean;
          contact_email?: string | null;
          created_at?: string;
          dba_name?: string | null;
          ein?: string | null;
          expected_average_transaction_size?: number | null;
          expected_monthly_transaction_volume?: number | null;
          formation_state?: string | null;
          id?: string;
          industry?: string | null;
          intended_use_of_account?: string | null;
          legal_business_name?: string;
          mailing_address?: string | null;
          owner_id?: string;
          phone_number?: string | null;
          reviewed_at?: string | null;
          source_of_funds?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "under_review"
            | "more_info_needed"
            | "approved"
            | "rejected"
            | "partner_review";
          submitted_at?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          accepted_privacy_at: string | null;
          accepted_terms_at: string | null;
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          display_name: string | null;
          id: string;
          role: "user" | "admin";
          updated_at: string;
        };
        Insert: {
          accepted_privacy_at?: string | null;
          accepted_terms_at?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          id: string;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Update: {
          accepted_privacy_at?: string | null;
          accepted_terms_at?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          id?: string;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
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
