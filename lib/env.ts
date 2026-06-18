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
    return configuredUrl.replace(/\/$/, "");
  }

  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
