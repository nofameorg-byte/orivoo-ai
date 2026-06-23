import { redirect } from "next/navigation";
import { Link2, Mail } from "lucide-react";
import { createProfessionalInvitation } from "@/app/actions/beta";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type InvitePageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

type CompanyOption = {
  id: string;
  company_name: string;
};

type InviteRow = {
  id: string;
  email: string;
  invite_token: string;
  status: string;
  expires_at: string;
};

export default async function InviteProfessionalsPage({
  searchParams,
}: InvitePageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?messageKey=auth.messageDashboardRequired");
  }

  const { data: companiesData } = await supabase
    .from("companies")
    .select("id, company_name")
    .eq("owner_id", user.id)
    .order("company_name");
  const companies = (companiesData ?? []) as unknown as CompanyOption[];
  const { data: invitesData } = await supabase
    .from("professional_invitations")
    .select("id, email, invite_token, status, expires_at")
    .eq("invited_by", user.id)
    .order("created_at", { ascending: false });
  const invites = (invitesData ?? []) as unknown as InviteRow[];

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        currentPath="/invite-professionals"
      />
      <PageHero
        badge={t(dictionary, "beta.inviteLink")}
        title={t(dictionary, "beta.inviteTitle")}
        body={t(dictionary, "beta.inviteBody")}
      />
      <section className="section-shell grid gap-6 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          action={createProfessionalInvitation}
          className="rounded-[2rem] border border-border bg-panel p-6"
        >
          {params.message ? (
            <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-semibold text-gold-deep">
              {params.message}
            </div>
          ) : null}
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <Mail className="size-6 text-gold" aria-hidden />
            {t(dictionary, "beta.generateInvite")}
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "beta.inviteEmail")}
              </span>
              <input
                required
                type="email"
                name="email"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "common.companyName")}
              </span>
              <select
                name="companyId"
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              >
                <option value="">{t(dictionary, "common.optional")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                {t(dictionary, "beta.inviteMessage")}
              </span>
              <textarea
                name="message"
                className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-background p-3 text-foreground"
              />
            </label>
            <button
              type="submit"
              className="vp23-primary-action rounded-full px-5 py-3 text-sm font-black"
            >
              {t(dictionary, "beta.generateInvite")}
            </button>
          </div>
        </form>

        <section className="rounded-[2rem] border border-border bg-panel p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black text-foreground">
            <Link2 className="size-6 text-gold" aria-hidden />
            {t(dictionary, "beta.invitationStatus")}
          </h2>
          <div className="mt-5 grid gap-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-2xl border border-border bg-panel-soft p-4 text-sm text-muted"
              >
                <p className="font-bold text-foreground">{invite.email}</p>
                <p className="mt-1">{invite.status}</p>
                <p className="mt-1 break-all">{invite.invite_token}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
