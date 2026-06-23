export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRole = "customer" | "professional" | "admin";
type LanguageCode = "en" | "es";
type VerificationStatus = "pending" | "approved" | "rejected" | "expired";
type VerificationType =
  | "identity"
  | "business"
  | "license"
  | "insurance"
  | "bank_account"
  | "revenue"
  | "vp23_elite";
type JobStatus =
  | "draft"
  | "pending"
  | "requested"
  | "accepted"
  | "declined"
  | "converted_to_job"
  | "scheduled"
  | "in_progress"
  | "active"
  | "completed"
  | "cancelled";
type BusinessDocumentStatus = "draft" | "sent" | "accepted" | "declined" | "void";
type DocumentType =
  | "contract"
  | "permit"
  | "inspection_report"
  | "insurance_document"
  | "license"
  | "photo"
  | "other";
type PartnerType =
  | "working_capital"
  | "equipment_financing"
  | "vehicle_financing"
  | "insurance_provider"
  | "equipment_rental"
  | "material_supplier"
  | "business_service"
  | "invoice_factoring";

type GenericTable = {
  Row: Record<string, Json>;
  Insert: Record<string, Json | undefined>;
  Update: Record<string, Json | undefined>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          phone: string | null;
          preferred_language: LanguageCode;
          role: ProfileRole;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          phone?: string | null;
          preferred_language?: LanguageCode;
          role?: ProfileRole;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          phone?: string | null;
          preferred_language?: LanguageCode;
          role?: ProfileRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: GenericTable;
      companies: GenericTable;
      saved_companies: GenericTable;
      quote_requests: GenericTable;
      jobs: GenericTable;
      estimates: GenericTable;
      invoices: GenericTable;
      contracts: GenericTable;
      change_orders: GenericTable;
      documents: GenericTable;
      licenses: GenericTable;
      insurance_policies: GenericTable;
      verification_requests: GenericTable;
      reviews: GenericTable;
      review_media: GenericTable;
      review_helpful_votes: GenericTable;
      review_flags: GenericTable;
      company_claims: GenericTable;
      professional_invitations: GenericTable;
      company_views: GenericTable;
      partner_companies: GenericTable;
      equipment_listings: GenericTable;
      notifications: GenericTable;
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
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      owns_company: {
        Args: {
          company_uuid: string;
        };
        Returns: boolean;
      };
      company_customer: {
        Args: {
          company_uuid: string;
        };
        Returns: boolean;
      };
      has_profile_role: {
        Args: {
          required_role: ProfileRole;
        };
        Returns: boolean;
      };
      refresh_company_verification_flags: {
        Args: {
          company_uuid: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      profile_role: ProfileRole;
      language_code: LanguageCode;
      verification_type: VerificationType;
      verification_status: VerificationStatus;
      job_status: JobStatus;
      business_document_status: BusinessDocumentStatus;
      document_type: DocumentType;
      partner_type: PartnerType;
    };
    CompositeTypes: Record<string, never>;
  };
};
