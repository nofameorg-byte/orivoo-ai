"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { selectAssistantModel } from "@/app/actions/assistant";
import {
  assistantModels,
  canUseAssistantModel,
  type AssistantModelId,
  type SubscriptionTier,
} from "@/lib/assistant/models";

const upgradeMessage = "Upgrade to ORIVOO Pro to access premium models.";

export function AssistantModelSelector({
  selectedModel,
  subscriptionTier,
  onSelectedModelChange,
}: {
  selectedModel: AssistantModelId;
  subscriptionTier: SubscriptionTier;
  onSelectedModelChange: (modelId: AssistantModelId) => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSelectModel(modelId: AssistantModelId) {
    const hasAccess = canUseAssistantModel({
      modelId,
      subscriptionTier,
    });

    if (!hasAccess) {
      setMessage(upgradeMessage);
      return;
    }

    setMessage(null);
    setIsSaving(true);

    try {
      const result = await selectAssistantModel(modelId);

      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      onSelectedModelChange(result.selectedModel as AssistantModelId);
    } catch {
      setMessage("Could not save your selected model.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-[1.5rem] border border-white/10 bg-black/40 p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Model</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {subscriptionTier} tier
        </p>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {assistantModels.map((model) => {
          const isSelected = model.id === selectedModel;
          const isLocked = !canUseAssistantModel({
            modelId: model.id,
            subscriptionTier,
          });

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => handleSelectModel(model.id)}
              className={`rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black ${
                isSelected
                  ? "border-gold/50 bg-gold/10"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/10"
              }`}
              aria-pressed={isSelected}
              disabled={isSaving}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{model.name}</span>
                {isLocked ? (
                  <Lock className="size-4 shrink-0 text-gold" aria-hidden />
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {model.provider}
              </span>
              <span
                className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                  model.badge === "Free"
                    ? "border-gold/30 bg-gold/10 text-gold-bright"
                    : "border-white/10 bg-white/[0.04] text-muted"
                }`}
              >
                {model.badge}
              </span>
            </button>
          );
        })}
      </div>

      {message ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold-bright"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
