export function sanitizeSignupRole(role: string) {
  return role === "professional" ? "professional" : "customer";
}
