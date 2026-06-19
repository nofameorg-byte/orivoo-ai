export const teamPlans = ["business", "enterprise"] as const;

export const projectMemberRoles = [
  { value: "owner", label: "Owner", description: "Full control" },
  { value: "admin", label: "Admin", description: "Manage workspace" },
  { value: "editor", label: "Editor", description: "Edit content" },
  { value: "viewer", label: "Viewer", description: "Read only" },
] as const;

export type ProjectMemberRole = (typeof projectMemberRoles)[number]["value"];

const roleValues = new Set<string>(
  projectMemberRoles.map((role) => role.value),
);

export function isProjectMemberRole(value: string): value is ProjectMemberRole {
  return roleValues.has(value);
}

export function canAssignRole(value: string): value is Exclude<
  ProjectMemberRole,
  "owner"
> {
  return value === "admin" || value === "editor" || value === "viewer";
}

export function getProjectMemberRoleLabel(value: string) {
  return projectMemberRoles.find((role) => role.value === value)?.label ?? value;
}

export function getProjectMemberRoleDescription(value: string) {
  return (
    projectMemberRoles.find((role) => role.value === value)?.description ??
    "Project access"
  );
}

export function isTeamPlan(plan: string | null | undefined) {
  return plan === "business" || plan === "enterprise";
}
