export const artifactTypes = [
  { value: "document", label: "Document" },
  { value: "report", label: "Report" },
  { value: "code", label: "Code" },
  { value: "website_plan", label: "Website Plan" },
  { value: "research", label: "Research" },
  { value: "business_plan", label: "Business Plan" },
  { value: "legal_draft", label: "Legal Draft" },
  { value: "civic_report", label: "Civic Report" },
] as const;

export type ArtifactType = (typeof artifactTypes)[number]["value"];

const artifactTypeValues = new Set<string>(
  artifactTypes.map((artifactType) => artifactType.value),
);

export function isArtifactType(value: string): value is ArtifactType {
  return artifactTypeValues.has(value);
}

export function getArtifactTypeLabel(value: string) {
  return (
    artifactTypes.find((artifactType) => artifactType.value === value)?.label ??
    value
  );
}
