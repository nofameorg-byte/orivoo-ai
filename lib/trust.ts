import type { VerificationBadge } from "@/components/marketplace";

type CompanyVerificationFlags = {
  is_identity_verified?: boolean | null;
  is_business_verified?: boolean | null;
  is_license_verified?: boolean | null;
  is_insurance_verified?: boolean | null;
  is_revenue_verified?: boolean | null;
  is_vp23_elite?: boolean | null;
};

export function companyTrustBadges(
  labels: string[],
  company?: CompanyVerificationFlags | null,
): VerificationBadge[] {
  const isVp23Verified = Boolean(
    company?.is_business_verified &&
      company?.is_license_verified &&
      company?.is_insurance_verified,
  );
  const statuses = [
    isVp23Verified,
    company?.is_identity_verified,
    company?.is_business_verified,
    company?.is_license_verified,
    company?.is_insurance_verified,
    company?.is_revenue_verified,
    company?.is_vp23_elite,
  ];

  return labels.map((label, index) => ({
    label,
    status: statuses[index] ? "approved" : "missing",
  }));
}
