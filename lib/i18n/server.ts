import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

type Primitive = string | number | boolean | null | undefined;

export async function getLocale(fallback?: string | null): Promise<Locale> {
  if (isLocale(fallback)) {
    return fallback;
  }

  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("vp23_locale")?.value;

  return isLocale(storedLocale) ? storedLocale : defaultLocale;
}

export async function getDictionary(locale?: Locale | null): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())];
}

export function t(
  dictionary: Dictionary,
  key: string,
  replacements: Record<string, Primitive> = {},
): string {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, dictionary);

  if (typeof value !== "string") {
    return key;
  }

  return Object.entries(replacements).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement ?? "")),
    value,
  );
}

export function list<T>(value: readonly T[] | T[]): T[] {
  return [...value];
}
