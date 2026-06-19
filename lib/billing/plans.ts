export type PlanId = "free" | "pro" | "team" | "enterprise";

export const plans: Record<
  PlanId,
  {
    description: string;
    features: string[];
    limits: {
      aiMessagesPerDay: number | "unlimited";
      documents: number | "unlimited";
      reports: number | "unlimited";
    };
    name: string;
    price: string;
  }
> = {
  enterprise: {
    description: "Unlimited scale with admin controls.",
    features: ["Unlimited usage", "Admin controls", "Priority support"],
    limits: {
      aiMessagesPerDay: "unlimited",
      documents: "unlimited",
      reports: "unlimited",
    },
    name: "Enterprise",
    price: "Custom",
  },
  free: {
    description: "Start building with ORIVOO.",
    features: ["50 AI messages/day", "10 documents", "3 research reports"],
    limits: {
      aiMessagesPerDay: 50,
      documents: 10,
      reports: 3,
    },
    name: "Free",
    price: "$0",
  },
  pro: {
    description: "Higher limits for solo operators.",
    features: ["Higher AI limits", "More documents", "More research"],
    limits: {
      aiMessagesPerDay: 500,
      documents: 100,
      reports: 50,
    },
    name: "Pro",
    price: "Upgrade",
  },
  team: {
    description: "Shared studios for teams.",
    features: ["Shared projects", "Shared documents", "Shared chats"],
    limits: {
      aiMessagesPerDay: 2000,
      documents: 500,
      reports: 200,
    },
    name: "Team",
    price: "Upgrade",
  },
};

export function getStripePriceEnv(plan: PlanId) {
  if (plan === "pro") return process.env.STRIPE_PRO_PRICE_ID;
  if (plan === "team") return process.env.STRIPE_TEAM_PRICE_ID;
  if (plan === "enterprise") return process.env.STRIPE_ENTERPRISE_PRICE_ID;
  return null;
}
