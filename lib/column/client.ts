import "server-only";

type ColumnRequestOptions = {
  method?: "GET" | "POST";
  path: string;
  body?: unknown;
  idempotencyKey?: string;
};

export function getColumnConfig() {
  return {
    apiKey: process.env.COLUMN_API_KEY ?? "",
    baseUrl: process.env.COLUMN_BASE_URL ?? "https://api.column.com",
    partnerBankId: process.env.COLUMN_PARTNER_BANK_ID ?? "",
    sponsorBankName: process.env.SPONSOR_BANK_NAME ?? "Sponsor bank pending",
    environment: process.env.COLUMN_ENVIRONMENT ?? "sandbox",
  };
}

export function getColumnConnectionStatus() {
  const config = getColumnConfig();

  return {
    configured: Boolean(config.apiKey),
    environment: config.environment,
    sponsorBankName: config.sponsorBankName,
    partnerBankConfigured: Boolean(config.partnerBankId),
  };
}

export function createIdempotencyKey(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function columnRequest<TResponse>({
  method = "GET",
  path,
  body,
  idempotencyKey,
}: ColumnRequestOptions): Promise<TResponse> {
  const config = getColumnConfig();

  if (!config.apiKey) {
    throw new Error("COLUMN_API_KEY is not configured.");
  }

  const response = await fetch(new URL(path, config.baseUrl), {
    method,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Column request failed with status ${response.status}.`);
  }

  return (await response.json()) as TResponse;
}
