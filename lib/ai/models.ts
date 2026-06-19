import type { SubscriptionTier } from "@/lib/square";

export type AiProvider = "groq" | "openai" | "anthropic" | "gemini";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ModelDefinition = {
  id: string;
  label: string;
  provider: AiProvider;
  providerModel: string;
  minTier: SubscriptionTier;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  envKey: string;
  future?: boolean;
};

const tierRank: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

export const aiModels: ModelDefinition[] = [
  {
    id: "groq-fast",
    label: "Groq Fast",
    provider: "groq",
    providerModel: process.env.GROQ_DEFAULT_MODEL ?? "llama-3.3-70b-versatile",
    minTier: "free",
    inputCostPerMillion: 0.59,
    outputCostPerMillion: 0.79,
    envKey: "GROQ_API_KEY",
  },
  {
    id: "gpt-4.1",
    label: "OpenAI GPT-4.1",
    provider: "openai",
    providerModel: process.env.OPENAI_GPT_4_1_MODEL ?? "gpt-4.1",
    minTier: "pro",
    inputCostPerMillion: 2,
    outputCostPerMillion: 8,
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "claude-sonnet",
    label: "Claude Sonnet",
    provider: "anthropic",
    providerModel:
      process.env.ANTHROPIC_SONNET_MODEL ?? "claude-sonnet-4-20250514",
    minTier: "pro",
    inputCostPerMillion: 3,
    outputCostPerMillion: 15,
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "claude-opus",
    label: "Future Claude Opus",
    provider: "anthropic",
    providerModel: process.env.ANTHROPIC_OPUS_MODEL ?? "claude-opus-4-20250514",
    minTier: "enterprise",
    inputCostPerMillion: 15,
    outputCostPerMillion: 75,
    envKey: "ANTHROPIC_API_KEY",
    future: true,
  },
  {
    id: "gemini",
    label: "Future Gemini",
    provider: "gemini",
    providerModel: process.env.GEMINI_MODEL ?? "gemini-2.5-pro",
    minTier: "enterprise",
    inputCostPerMillion: 1.25,
    outputCostPerMillion: 10,
    envKey: "GEMINI_API_KEY",
    future: true,
  },
];

export function normalizeTier(value: string | null | undefined): SubscriptionTier {
  if (
    value === "pro" ||
    value === "business" ||
    value === "enterprise" ||
    value === "free"
  ) {
    return value;
  }

  return "free";
}

export function canUseModel(tier: SubscriptionTier, model: ModelDefinition) {
  return tierRank[tier] >= tierRank[model.minTier] && !model.future;
}

export function getAvailableModels(tier: SubscriptionTier) {
  return aiModels.map((model) => ({
    ...model,
    permitted: canUseModel(tier, model),
    configured: Boolean(process.env[model.envKey]),
  }));
}

export function getModel(modelId: string | undefined) {
  return aiModels.find((model) => model.id === modelId);
}

export function estimateTokens(messagesOrText: ChatMessage[] | string) {
  const text = Array.isArray(messagesOrText)
    ? messagesOrText.map((message) => message.content).join(" ")
    : messagesOrText;

  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCost(input: {
  model: ModelDefinition;
  inputTokens: number;
  outputTokens: number;
}) {
  const inputCost =
    (input.inputTokens / 1_000_000) * input.model.inputCostPerMillion;
  const outputCost =
    (input.outputTokens / 1_000_000) * input.model.outputCostPerMillion;

  return Number((inputCost + outputCost).toFixed(6));
}

export function getRoutingCandidates(input: {
  requestedModelId?: string;
  tier: SubscriptionTier;
}) {
  const requested = getModel(input.requestedModelId);
  const permittedConfigured = aiModels.filter(
    (model) => canUseModel(input.tier, model) && process.env[model.envKey],
  );

  if (requested) {
    if (!canUseModel(input.tier, requested)) {
      throw new Error("Your plan does not include that model.");
    }

    return [
      requested,
      ...permittedConfigured.filter((model) => model.id !== requested.id),
    ];
  }

  return permittedConfigured;
}
