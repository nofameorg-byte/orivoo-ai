export type SubscriptionTier = "free" | "pro" | "business" | "enterprise";

export type AssistantModelId =
  | "groq-llama-3.3-70b"
  | "gpt-4.1"
  | "claude-sonnet-4";

export type AssistantModel = {
  id: AssistantModelId;
  name: string;
  provider: string;
  badge: "Free" | "Premium";
  minimumTier: SubscriptionTier;
  route: "groq" | "openai" | "anthropic";
  providerModel: string;
};

export const defaultSubscriptionTier: SubscriptionTier = "free";
export const defaultAssistantModelId: AssistantModelId = "groq-llama-3.3-70b";

export const assistantModels: AssistantModel[] = [
  {
    id: defaultAssistantModelId,
    name: "Llama 3.3 70B",
    provider: "Groq",
    badge: "Free",
    minimumTier: "free",
    route: "groq",
    providerModel: "llama-3.3-70b-versatile",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    badge: "Premium",
    minimumTier: "pro",
    route: "openai",
    providerModel: "gpt-4.1",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    badge: "Premium",
    minimumTier: "pro",
    route: "anthropic",
    providerModel: "claude-sonnet-4",
  },
];

export function getAssistantModel(modelId: string | null | undefined) {
  return assistantModels.find((model) => model.id === modelId);
}

export function normalizeSubscriptionTier(
  tier: string | null | undefined,
): SubscriptionTier {
  if (tier === "pro" || tier === "business" || tier === "enterprise") {
    return tier;
  }

  return defaultSubscriptionTier;
}

export function normalizeAssistantModelId(
  modelId: string | null | undefined,
): AssistantModelId {
  return getAssistantModel(modelId)?.id ?? defaultAssistantModelId;
}

export function canUseAssistantModel({
  modelId,
  subscriptionTier,
}: {
  modelId: string;
  subscriptionTier: SubscriptionTier;
}) {
  const model = getAssistantModel(modelId);

  if (!model) {
    return false;
  }

  if (subscriptionTier === "enterprise") {
    return true;
  }

  if (subscriptionTier === "pro" || subscriptionTier === "business") {
    return model.minimumTier === "free" || model.minimumTier === "pro";
  }

  return model.minimumTier === "free";
}

export function resolveAssistantModelForTier({
  modelId,
  subscriptionTier,
}: {
  modelId: string | null | undefined;
  subscriptionTier: SubscriptionTier;
}) {
  const normalizedModelId = normalizeAssistantModelId(modelId);

  if (
    canUseAssistantModel({
      modelId: normalizedModelId,
      subscriptionTier,
    })
  ) {
    return getAssistantModel(normalizedModelId) ?? assistantModels[0];
  }

  return assistantModels[0];
}

export function canUseTeamWorkspaces(subscriptionTier: SubscriptionTier) {
  return subscriptionTier === "business" || subscriptionTier === "enterprise";
}

export function canUseFutureEnterpriseModels(
  subscriptionTier: SubscriptionTier,
) {
  return subscriptionTier === "enterprise";
}
