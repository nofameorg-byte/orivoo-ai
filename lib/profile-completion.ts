type CompletionCompany = {
  logo_url?: string | null;
  cover_image_url?: string | null;
  photos?: string[] | null;
  videos?: string[] | null;
  is_business_verified?: boolean | null;
  is_license_verified?: boolean | null;
  is_insurance_verified?: boolean | null;
  is_identity_verified?: boolean | null;
  is_revenue_verified?: boolean | null;
  is_vp23_elite?: boolean | null;
};

type CompletionInputs = {
  company?: CompletionCompany | null;
  licenseCount: number;
  insuranceCount: number;
  reviewCount: number;
};

export function profileCompletionScore({
  company,
  licenseCount,
  insuranceCount,
  reviewCount,
}: CompletionInputs) {
  const checks = [
    Boolean(company?.logo_url),
    Boolean(company?.cover_image_url),
    licenseCount > 0,
    insuranceCount > 0,
    reviewCount > 0,
    Boolean(company?.photos?.length || company?.videos?.length),
    Boolean(
      company?.is_business_verified ||
        company?.is_license_verified ||
        company?.is_insurance_verified ||
        company?.is_identity_verified ||
        company?.is_revenue_verified ||
        company?.is_vp23_elite,
    ),
  ];
  const completed = checks.filter(Boolean).length;

  return {
    score: Math.round((completed / checks.length) * 100),
    checks,
  };
}
