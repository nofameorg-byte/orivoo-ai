export type ResearchAction =
  | "executive-summary"
  | "swot"
  | "business-opportunity"
  | "competitor"
  | "grant"
  | "market"
  | "government"
  | "strategic-recommendations";

export const RESEARCH_SECTIONS = [
  "Executive Summary",
  "Key Findings",
  "Market Analysis",
  "Opportunities",
  "Risks",
  "Recommendations",
] as const;

export const RESEARCH_ACTIONS: Record<
  ResearchAction,
  {
    label: string;
    prompt: string;
  }
> = {
  "executive-summary": {
    label: "Generate Executive Summary",
    prompt:
      "Generate a sharper executive summary with strategic context, decision implications, and a concise bottom line.",
  },
  swot: {
    label: "Generate SWOT Analysis",
    prompt:
      "Generate a SWOT analysis with strengths, weaknesses, opportunities, and threats. Keep each point specific and actionable.",
  },
  "business-opportunity": {
    label: "Generate Business Opportunity Analysis",
    prompt:
      "Generate a business opportunity analysis with customer segments, value propositions, revenue paths, partnerships, and execution priorities.",
  },
  competitor: {
    label: "Generate Competitor Analysis",
    prompt:
      "Generate a competitor analysis with direct competitors, indirect competitors, differentiation, positioning, and risks.",
  },
  grant: {
    label: "Generate Grant Research",
    prompt:
      "Generate grant research with likely funding categories, target agencies or foundations, eligibility considerations, and application strategy.",
  },
  market: {
    label: "Generate Market Research",
    prompt:
      "Generate market research with market structure, demand drivers, customer segments, trends, barriers, and near-term signals.",
  },
  government: {
    label: "Generate Government Research",
    prompt:
      "Generate government research with public agencies, policy context, procurement or incentive pathways, compliance factors, and public data sources.",
  },
  "strategic-recommendations": {
    label: "Generate Strategic Recommendations",
    prompt:
      "Generate strategic recommendations ranked by impact and effort, with next actions, owners, and validation steps.",
  },
};
