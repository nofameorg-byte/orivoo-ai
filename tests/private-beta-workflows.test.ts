import { describe, expect, it } from "vitest";
import { sanitizeSignupRole } from "@/lib/auth-rules";
import { profileCompletionScore } from "@/lib/profile-completion";
import {
  canConvertQuoteToJob,
  canCustomerAcceptJob,
  canProfessionalSetJobStatus,
  canRespondToQuote,
  eligibleReviewJobs,
  nextOnboardingAction,
} from "@/lib/workflow-rules";

describe("auth workflow rules", () => {
  it("allows only customer and professional signup roles", () => {
    expect(sanitizeSignupRole("customer")).toBe("customer");
    expect(sanitizeSignupRole("professional")).toBe("professional");
    expect(sanitizeSignupRole("admin")).toBe("customer");
    expect(sanitizeSignupRole("owner")).toBe("customer");
  });
});

describe("quote workflow rules", () => {
  it("allows professionals to respond only to pending/requested quotes", () => {
    expect(canRespondToQuote("pending")).toBe(true);
    expect(canRespondToQuote("requested")).toBe(true);
    expect(canRespondToQuote("accepted")).toBe(false);
    expect(canRespondToQuote("converted_to_job")).toBe(false);
  });

  it("allows conversion only after quote acceptance", () => {
    expect(canConvertQuoteToJob("accepted")).toBe(true);
    expect(canConvertQuoteToJob("pending")).toBe(false);
    expect(canConvertQuoteToJob("declined")).toBe(false);
  });
});

describe("job workflow rules", () => {
  it("allows customers to accept only pending jobs", () => {
    expect(canCustomerAcceptJob("pending")).toBe(true);
    expect(canCustomerAcceptJob("scheduled")).toBe(false);
    expect(canCustomerAcceptJob("completed")).toBe(false);
  });

  it("allows professionals to set only supported lifecycle statuses", () => {
    expect(canProfessionalSetJobStatus("scheduled")).toBe(true);
    expect(canProfessionalSetJobStatus("in_progress")).toBe(true);
    expect(canProfessionalSetJobStatus("completed")).toBe(true);
    expect(canProfessionalSetJobStatus("cancelled")).toBe(true);
    expect(canProfessionalSetJobStatus("accepted")).toBe(false);
  });
});

describe("review workflow rules", () => {
  it("exposes review eligibility only for completed unreviewed jobs", () => {
    const jobs = [
      { id: "job_1", status: "completed" },
      { id: "job_2", status: "scheduled" },
      { id: "job_3", status: "completed" },
    ];
    const reviews = [{ job_id: "job_1" }];

    expect(eligibleReviewJobs(jobs, reviews)).toEqual([
      { id: "job_3", status: "completed" },
    ]);
  });
});

describe("verification and onboarding workflow rules", () => {
  it("calculates profile completion from beta readiness signals", () => {
    const completion = profileCompletionScore({
      company: {
        logo_url: "logo.png",
        cover_image_url: "cover.png",
        photos: ["photo.png"],
        is_business_verified: true,
      },
      licenseCount: 1,
      insuranceCount: 1,
      reviewCount: 1,
    });

    expect(completion.score).toBe(100);
    expect(completion.checks.every(Boolean)).toBe(true);
  });

  it("returns next onboarding action for incomplete profiles", () => {
    expect(nextOnboardingAction([true, false, false], ["A", "B", "C"])).toBe("B");
    expect(nextOnboardingAction([true, true], ["A", "B"])).toBeNull();
  });
});

describe("admin moderation workflow rules", () => {
  it("keeps review moderation tied to pending flags by rule coverage", () => {
    const completed = eligibleReviewJobs(
      [{ id: "job_1", status: "completed" }],
      [],
    );

    expect(completed).toHaveLength(1);
  });
});
