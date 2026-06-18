export type WebsiteAction =
  | "regenerate"
  | "seo"
  | "copy"
  | "blog"
  | "marketing"
  | "social";

export const REQUIRED_WEBSITE_PAGES = [
  "Home Page",
  "About Page",
  "Services Page",
  "Contact Page",
  "Privacy Policy",
  "Terms Page",
] as const;

export const WEBSITE_ACTIONS: Record<
  WebsiteAction,
  {
    label: string;
    prompt: string;
  }
> = {
  blog: {
    label: "Generate Blog Ideas",
    prompt:
      "Generate a practical blog content plan with article titles, search intent, audience, and CTA suggestions.",
  },
  copy: {
    label: "Improve Copy",
    prompt:
      "Improve the website copy for clarity, conversion, trust, and brand polish while preserving the core offer.",
  },
  marketing: {
    label: "Generate Marketing Plan",
    prompt:
      "Generate a marketing plan with channels, launch sequence, offers, lead magnets, and measurement plan.",
  },
  regenerate: {
    label: "Regenerate Website",
    prompt:
      "Regenerate the full website with stronger structure, clearer positioning, and improved page content.",
  },
  seo: {
    label: "Improve SEO",
    prompt:
      "Improve SEO meta titles, meta descriptions, page headings, internal linking ideas, and search-focused copy.",
  },
  social: {
    label: "Generate Social Media Plan",
    prompt:
      "Generate a social media plan with content pillars, post ideas, platform recommendations, and CTAs.",
  },
};
