import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getRequiredEnv, getSiteUrl } from "@/lib/env";

export type SubscriptionTier = "free" | "pro" | "business" | "enterprise";
export type SubscriptionStatus =
  | "inactive"
  | "pending"
  | "active"
  | "canceled"
  | "paused"
  | "past_due"
  | "failed";

type SquareRequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
};

type TierConfig = {
  name: string;
  amount: number;
  currency: string;
  planVariationId: string;
};

const tierEnvMap = {
  pro: {
    planVariation: "SQUARE_PRO_PLAN_VARIATION_ID",
    amount: "SQUARE_PRO_PRICE_AMOUNT",
  },
  business: {
    planVariation: "SQUARE_BUSINESS_PLAN_VARIATION_ID",
    amount: "SQUARE_BUSINESS_PRICE_AMOUNT",
  },
  enterprise: {
    planVariation: "SQUARE_ENTERPRISE_PLAN_VARIATION_ID",
    amount: "SQUARE_ENTERPRISE_PRICE_AMOUNT",
  },
} as const;

export function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function getSquareApiVersion() {
  return process.env.SQUARE_API_VERSION ?? "2026-05-20";
}

export function getBillableTier(value: string): Exclude<SubscriptionTier, "free"> {
  if (value === "pro" || value === "business" || value === "enterprise") {
    return value;
  }

  throw new Error("Choose a paid subscription tier.");
}

export function getTierConfig(tier: Exclude<SubscriptionTier, "free">): TierConfig {
  const env = tierEnvMap[tier];
  const amount = Number.parseInt(getRequiredEnv(env.amount), 10);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${env.amount} must be a positive integer in cents.`);
  }

  return {
    name: `ORIVOO AI ${tier[0].toUpperCase()}${tier.slice(1)} Subscription`,
    amount,
    currency: process.env.SQUARE_CURRENCY ?? "USD",
    planVariationId: getRequiredEnv(env.planVariation),
  };
}

export async function squareRequest<T>(
  path: string,
  options: SquareRequestOptions = {},
) {
  const response = await fetch(`${getSquareBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getRequiredEnv("SQUARE_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      "Square-Version": getSquareApiVersion(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    errors?: Array<{ detail?: string; code?: string }>;
  };

  if (!response.ok) {
    const message =
      payload.errors
        ?.map((error) => error.detail ?? error.code)
        .filter(Boolean)
        .join("; ") || `Square request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return payload as T;
}

export async function createSquareCustomer(input: {
  email?: string | null;
  displayName?: string | null;
  userId: string;
}) {
  const [givenName, ...familyNameParts] = (input.displayName ?? "")
    .split(" ")
    .filter(Boolean);
  const payload = await squareRequest<{
    customer?: {
      id?: string;
    };
  }>("/v2/customers", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      email_address: input.email,
      given_name: givenName || undefined,
      family_name: familyNameParts.join(" ") || undefined,
      reference_id: input.userId,
    },
  });
  const customerId = payload.customer?.id;

  if (!customerId) {
    throw new Error("Square did not return a customer ID.");
  }

  return customerId;
}

export async function createSquareSubscriptionCheckout(input: {
  tier: Exclude<SubscriptionTier, "free">;
  customerId: string;
  email?: string | null;
  userId: string;
  action: string;
}) {
  const tierConfig = getTierConfig(input.tier);
  const payload = await squareRequest<{
    payment_link?: {
      id?: string;
      url?: string;
      order_id?: string;
    };
  }>("/v2/online-checkout/payment-links", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      description: `${tierConfig.name} (${input.action})`,
      quick_pay: {
        name: tierConfig.name,
        price_money: {
          amount: tierConfig.amount,
          currency: tierConfig.currency,
        },
        location_id: getRequiredEnv("SQUARE_LOCATION_ID"),
      },
      checkout_options: {
        subscription_plan_id: tierConfig.planVariationId,
        redirect_url: `${getSiteUrl()}/dashboard?billing=success`,
      },
      pre_populated_data: {
        buyer_email: input.email ?? undefined,
      },
      payment_note: `orivoo_user_id=${input.userId};tier=${input.tier};action=${input.action};customer_id=${input.customerId}`,
    },
  });
  const paymentLink = payload.payment_link;

  if (!paymentLink?.url || !paymentLink.id) {
    throw new Error("Square did not return a checkout URL.");
  }

  return {
    id: paymentLink.id,
    url: paymentLink.url,
    orderId: paymentLink.order_id ?? null,
  };
}

export async function cancelSquareSubscription(subscriptionId: string) {
  return squareRequest<unknown>(`/v2/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
  });
}

export async function resumeSquareSubscription(subscriptionId: string) {
  return squareRequest<unknown>(`/v2/subscriptions/${subscriptionId}/resume`, {
    method: "POST",
    body: {},
  });
}

export async function retrieveSquareSubscription(subscriptionId: string) {
  return squareRequest<{
    subscription?: SquareSubscriptionPayload;
  }>(`/v2/subscriptions/${subscriptionId}`);
}

export type SquareSubscriptionPayload = {
  id?: string;
  customer_id?: string;
  status?: string;
  plan_variation_id?: string;
  charged_through_date?: string;
  start_date?: string;
  canceled_date?: string;
  version?: number;
};

export function normalizeSquareStatus(status?: string): SubscriptionStatus {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "CANCELED":
    case "CANCELLED":
      return "canceled";
    case "PAUSED":
      return "paused";
    case "DEACTIVATED":
      return "past_due";
    case "PENDING":
      return "pending";
    default:
      return status ? "pending" : "failed";
  }
}

export function tierFromPlanVariationId(planVariationId?: string) {
  if (!planVariationId) {
    return "free" satisfies SubscriptionTier;
  }

  const matchingTier = (Object.keys(tierEnvMap) as Array<
    Exclude<SubscriptionTier, "free">
  >).find((tier) => process.env[tierEnvMap[tier].planVariation] === planVariationId);

  return matchingTier ?? ("free" satisfies SubscriptionTier);
}

export function verifySquareWebhookSignature(input: {
  rawBody: string;
  signature: string | null;
  notificationUrl: string;
}) {
  if (!input.signature) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    getRequiredEnv("SQUARE_WEBHOOK_SIGNATURE_KEY"),
  )
    .update(input.notificationUrl + input.rawBody)
    .digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(input.signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}
