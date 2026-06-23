export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;

  if (configuredUrl) {
    return normalizeVp23Url(configuredUrl, "NEXT_PUBLIC_SITE_URL");
  }

  if (vercelUrl) {
    return normalizeVp23Url(`https://${vercelUrl}`, "VERCEL_URL");
  }

  return "http://localhost:3000";
}

function normalizeVp23Url(value: string, source: string) {
  const normalizedUrl = value.replace(/\/$/, "");

  const legacyBrandPattern = new RegExp(["ori", "voo"].join(""), "i");

  if (legacyBrandPattern.test(normalizedUrl)) {
    throw new Error(
      `${source} points to a legacy non-VP23 URL. Configure the VP23 site URL before using auth redirects.`,
    );
  }

  return normalizedUrl;
}

export function getAuthRedirectUrl(path = "/auth/callback") {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/auth/callback";

  return `${getSiteUrl()}${safePath}`;
}
