import { redirect } from "next/navigation";
import { acceptProfessionalInvitation } from "@/app/actions/beta";
import { PageHero } from "@/components/page-primitives";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type InviteAcceptPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InviteAcceptPage({ params }: InviteAcceptPageProps) {
  const { token } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: invitation } = await supabase
    .from("professional_invitations")
    .select("email, status, expires_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (!invitation) {
    redirect("/invite-professionals?message=Invitation not found.");
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader dictionary={dictionary} locale={locale} currentPath={`/invite/${token}`} />
      <PageHero
        badge={t(dictionary, "beta.inviteLink")}
        title={t(dictionary, "transaction.inviteAcceptTitle")}
        body={t(dictionary, "beta.inviteBody")}
      />
      <section className="section-shell pb-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-border bg-panel p-6">
          <div className="space-y-2 text-sm text-muted">
            <p>{String(invitation.email)}</p>
            <p>{String(invitation.status)}</p>
            <p>{String(invitation.expires_at)}</p>
          </div>
          {user ? (
            <form action={acceptProfessionalInvitation} className="mt-6">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-black text-background"
              >
                {t(dictionary, "transaction.acceptInvite")}
              </button>
            </form>
          ) : (
            <a
              href={`/signup?invite=${token}`}
              className="mt-6 inline-flex w-full justify-center rounded-full bg-foreground px-5 py-3 text-sm font-black text-background"
            >
              {t(dictionary, "nav.signup")}
            </a>
          )}
        </div>
      </section>
      <SiteFooter dictionary={dictionary} />
    </main>
  );
}
