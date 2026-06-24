import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getStringField(
  body: unknown,
  field: string,
  options: { min?: number; max?: number; email?: boolean } = {},
) {
  if (!isRecord(body)) {
    return { value: "", error: "Request body must be a JSON object." };
  }

  const rawValue = body[field];

  if (typeof rawValue !== "string") {
    return { value: "", error: `${field} must be a string.` };
  }

  const value = rawValue.trim();
  const min = options.min ?? 1;
  const max = options.max ?? 160;

  if (value.length < min) {
    return { value, error: `${field} is too short.` };
  }

  if (value.length > max) {
    return { value, error: `${field} is too long.` };
  }

  if (options.email && !emailPattern.test(value)) {
    return { value, error: `${field} must be a valid email.` };
  }

  return { value, error: "" };
}

export function getAmountCentsField(body: unknown, field: string) {
  if (!isRecord(body)) {
    return { value: 0, error: "Request body must be a JSON object." };
  }

  const rawValue = body[field];
  const value =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
        ? Number(rawValue)
        : Number.NaN;

  if (!Number.isFinite(value) || value <= 0) {
    return { value: 0, error: `${field} must be greater than zero.` };
  }

  return { value: Math.round(value * 100), error: "" };
}

export function validationErrorResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
