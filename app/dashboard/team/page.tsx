import { Mail, Users } from "lucide-react";
import {
  acceptInvite,
  inviteUser,
  removeMember,
  revokeInvite,
  updateMemberRole,
} from "@/app/actions/team";
import { getAuthenticatedUser } from "@/lib/core/auth";

type TeamPageProps = {
  searchParams: Promise<{ message?: string; organizationId?: string }>;
};

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const { message, organizationId } = await searchParams;
  const { supabase, user } = await getAuthenticatedUser();
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id,organization_id,role,user_id")
    .eq("user_id", user.id);
  const orgIds = (memberships ?? []).map((membership) => membership.organization_id);
  const { data: organizations } = orgIds.length
    ? await supabase.from("organizations").select("id,name,owner_id").in("id", orgIds)
    : { data: [] };
  const selectedOrganization =
    organizations?.find((organization) => organization.id === organizationId) ??
    organizations?.[0] ??
    null;
  const [{ data: members }, { data: invites }, { data: myInvites }] =
    selectedOrganization
      ? await Promise.all([
          supabase
            .from("organization_members")
            .select("id,user_id,role")
            .eq("organization_id", selectedOrganization.id),
          supabase
            .from("invites")
            .select("id,email,role,status")
            .eq("organization_id", selectedOrganization.id),
          supabase
            .from("invites")
            .select("id,organization_id,email,role,status")
            .eq("email", user.email?.toLowerCase() ?? "")
            .eq("status", "pending"),
        ])
      : await Promise.all([
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          supabase
            .from("invites")
            .select("id,organization_id,email,role,status")
            .eq("email", user.email?.toLowerCase() ?? "")
            .eq("status", "pending"),
        ]);

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
          <Users className="size-4" aria-hidden />
          Team
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Team members, roles, and invites.
        </h1>
        <p className="mt-4 max-w-3xl text-muted">
          Invite users, remove users, and manage role permissions for shared
          ORIVOO projects and studio assets.
        </p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      {myInvites?.length ? (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Pending invites</h2>
          <div className="mt-4 grid gap-3">
            {myInvites.map((invite) => (
              <form
                key={invite.id}
                action={acceptInvite}
                className="rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <input type="hidden" name="inviteId" value={invite.id} />
                <p className="text-sm text-white">
                  Invite to organization {invite.organization_id} as {invite.role}
                </p>
                <button className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                  Accept invite
                </button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {selectedOrganization ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <form action={inviteUser} className="surface-card rounded-[2rem] p-6">
            <input
              type="hidden"
              name="organizationId"
              value={selectedOrganization.id}
            />
            <div className="mb-5 flex items-center gap-3">
              <Mail className="size-6 text-gold" aria-hidden />
              <h2 className="text-2xl font-semibold text-white">
                Invite users
              </h2>
            </div>
            <input
              name="email"
              type="email"
              placeholder="teammate@example.com"
              className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
            <select
              name="role"
              defaultValue="member"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
              Send invite
            </button>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold text-white">
              {selectedOrganization.name}
            </h2>
            <div className="mt-5 space-y-3">
              {(members ?? []).map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {member.user_id}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={updateMemberRole}>
                      <input type="hidden" name="organizationId" value={selectedOrganization.id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <select name="role" defaultValue={member.role} className="rounded-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white">
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button className="ml-2 rounded-full border border-gold/35 px-3 py-2 text-xs text-gold-bright">Update</button>
                    </form>
                    <form action={removeMember}>
                      <input type="hidden" name="organizationId" value={selectedOrganization.id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <button className="rounded-full border border-red-400/25 px-3 py-2 text-xs text-red-100">Remove</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-semibold text-white">Invites</h3>
            <div className="mt-3 space-y-2">
              {(invites ?? []).map((invite) => (
                <form key={invite.id} action={revokeInvite} className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <input type="hidden" name="organizationId" value={selectedOrganization.id} />
                  <input type="hidden" name="inviteId" value={invite.id} />
                  <p className="text-sm text-muted">{invite.email} · {invite.role} · {invite.status}</p>
                  {invite.status === "pending" ? <button className="mt-2 text-xs text-red-100">Revoke</button> : null}
                </form>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 p-10 text-center text-muted">
          Create an organization to invite teammates.
        </div>
      )}
    </div>
  );
}
