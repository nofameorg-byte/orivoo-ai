import { redirect } from "next/navigation";
import { Clock, MessageSquare, ShieldCheck } from "lucide-react";
import {
  decideVerificationRequest,
  moderateReview,
} from "@/app/actions/trust";
import { CardGrid, PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale, list, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type VerificationQueueItem = {
  id: string;
  verification_type: string;
  status: string;
  notes?: string | null;
  expires_at?: string | null;
  companies?: {
    company_name?: string | null;
  } | null;
};

type FlaggedReview = {
  id: string;
  title?: string | null;
  body?: string | null;
  rating?: number | null;
  companies?: {
    company_name?: string | null;
  } | null;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const locale = await getLocale(
    isLocale(profile?.preferred_language) ? profile?.preferred_language : null,
  );
  const dictionary = await getDictionary(locale);
  const sections = list(dictionary.admin.sections).map((section) => ({
    title: section,
    body: t(dictionary, "common.ready"),
  }));
  const { data: verificationData } = await supabase
    .from("verification_requests")
    .select("id, verification_type, status, notes, expires_at, companies(company_name)")
    .in("status", ["pending", "expired"])
    .order("created_at", { ascending: true });
  const verificationQueue =
    (verificationData ?? []) as unknown as VerificationQueueItem[];
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("id, title, body, rating, companies(company_name)")
    .eq("is_flagged", true)
    .eq("is_removed", false)
    .order("updated_at", { ascending: false });
  const flaggedReviews = (reviewData ?? []) as unknown as FlaggedReview[];

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath="/admin" />
      <PageHero
        badge={t(dictionary, "admin.badge")}
        title={t(dictionary, "admin.headline")}
        body={t(dictionary, "admin.body")}
      />
      <section className="section-shell pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
                <ShieldCheck className="size-6 text-gold" aria-hidden />
                {t(dictionary, "trustV2.adminQueueTitle")}
              </h2>
              <div className="mt-5 grid gap-3">
                {verificationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-panel-soft p-4"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h3 className="font-bold text-foreground">
                          {item.verification_type}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {item.companies?.company_name ?? item.notes}
                        </p>
                        {item.expires_at ? (
                          <p className="mt-1 text-xs text-muted">
                            {t(dictionary, "trustV2.expires")}: {item.expires_at}
                          </p>
                        ) : null}
                      </div>
                      <span className="inline-flex h-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-deep">
                        <Clock className="size-3" aria-hidden />
                        {item.status}
                      </span>
                    </div>
                    <form action={decideVerificationRequest} className="mt-4 grid gap-3">
                      <input type="hidden" name="requestId" value={item.id} />
                      <textarea
                        name="notes"
                        placeholder={t(dictionary, "trustEngine.adminDecisionNotes")}
                        className="min-h-20 rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                      />
                      <div className="grid gap-2 sm:grid-cols-3">
                        {[
                          ["approved", t(dictionary, "trustEngine.approve")],
                          ["rejected", t(dictionary, "trustEngine.reject")],
                          ["expired", t(dictionary, "trustEngine.markExpired")],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="submit"
                            name="decision"
                            value={value}
                            className="rounded-full border border-border px-3 py-2 text-sm font-bold text-foreground"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border bg-panel p-6">
              <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
                <MessageSquare className="size-6 text-gold" aria-hidden />
                {t(dictionary, "reviewsV2.moderationQueue")}
              </h2>
              <div className="mt-5 grid gap-3">
                {flaggedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-border bg-panel-soft p-4"
                  >
                    <h3 className="font-bold text-foreground">
                      {review.title ?? review.companies?.company_name}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{review.body}</p>
                    <form action={moderateReview} className="mt-4 grid gap-2 sm:grid-cols-2">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button
                        type="submit"
                        name="decision"
                        value="remove"
                        className="rounded-full border border-border px-3 py-2 text-sm font-bold text-foreground"
                      >
                        {t(dictionary, "trustEngine.removeReview")}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="keep"
                        className="rounded-full border border-border px-3 py-2 text-sm font-bold text-foreground"
                      >
                        {t(dictionary, "trustEngine.keepReview")}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CardGrid items={sections} />
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
