type JobForReview = {
  id: string;
  status?: string | null;
};

type ExistingReview = {
  job_id?: string | null;
};

export function canRespondToQuote(status?: string | null) {
  return status === "pending" || status === "requested";
}

export function canConvertQuoteToJob(status?: string | null) {
  return status === "accepted";
}

export function canCustomerAcceptJob(status?: string | null) {
  return status === "pending";
}

export function canProfessionalSetJobStatus(status: string) {
  return ["scheduled", "in_progress", "completed", "cancelled"].includes(status);
}

export function eligibleReviewJobs(
  jobs: JobForReview[],
  reviews: ExistingReview[],
) {
  const reviewedJobIds = new Set(
    reviews
      .map((review) => review.job_id)
      .filter((jobId): jobId is string => Boolean(jobId)),
  );

  return jobs.filter(
    (job) => job.status === "completed" && !reviewedJobIds.has(job.id),
  );
}

export function nextOnboardingAction(checks: boolean[], labels: string[]) {
  const nextIndex = checks.findIndex((check) => !check);

  return nextIndex === -1 ? null : labels[nextIndex] ?? null;
}
