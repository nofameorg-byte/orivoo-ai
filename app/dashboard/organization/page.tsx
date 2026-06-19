import Link from "next/link";
import { Building2, FolderKanban, Plus } from "lucide-react";
import { createOrganization } from "@/app/actions/team";
import { getAuthenticatedUser } from "@/lib/core/auth";

type OrganizationPageProps = {
  searchParams: Promise<{ message?: string; organizationId?: string }>;
};

export default async function OrganizationPage({
  searchParams,
}: OrganizationPageProps) {
  const { message, organizationId } = await searchParams;
  const { supabase, user } = await getAuthenticatedUser();
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id,role")
    .eq("user_id", user.id);
  const organizationIds = (memberships ?? []).map((member) => member.organization_id);
  const { data: organizations } = organizationIds.length
    ? await supabase.from("organizations").select("id,name,owner_id,created_at").in("id", organizationIds)
    : { data: [] };
  const selectedOrganization =
    organizations?.find((organization) => organization.id === organizationId) ??
    organizations?.[0] ??
    null;

  const [projects, conversations, documents, reports, websites, codeProjects] =
    selectedOrganization
      ? await Promise.all([
          supabase.from("projects").select("id,name,user_id").order("updated_at", { ascending: false }).limit(20),
          supabase.from("conversations").select("id,title,user_id").order("updated_at", { ascending: false }).limit(20),
          supabase.from("documents").select("id,title,user_id").order("updated_at", { ascending: false }).limit(20),
          supabase.from("research_reports").select("id,title,user_id").order("updated_at", { ascending: false }).limit(20),
          supabase.from("website_projects").select("id,title,user_id").order("updated_at", { ascending: false }).limit(20),
          supabase.from("code_projects").select("id,title,user_id").order("updated_at", { ascending: false }).limit(20),
        ])
      : await Promise.all([
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
        ]);

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
          <Building2 className="size-4" aria-hidden />
          Organization
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Shared ORIVOO workspace.
        </h1>
        <p className="mt-4 max-w-3xl text-muted">
          Team plans unlock shared projects, documents, chats, research,
          websites, and code projects across organization members.
        </p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <form action={createOrganization} className="surface-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Plus className="size-6 text-gold" aria-hidden />
            <h2 className="text-2xl font-semibold text-white">
              Create organization
            </h2>
          </div>
          <input
            name="name"
            placeholder="ORIVOO Team"
            className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
          />
          <button className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            Create organization
          </button>
          <div className="mt-6 space-y-2">
            {(organizations ?? []).map((organization) => (
              <Link
                key={organization.id}
                href={`/dashboard/organization?organizationId=${organization.id}`}
                className="block rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white"
              >
                {organization.name}
              </Link>
            ))}
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <FolderKanban className="size-6 text-gold" aria-hidden />
            <h2 className="text-2xl font-semibold text-white">
              {selectedOrganization?.name ?? "No organization selected"}
            </h2>
          </div>
          {selectedOrganization ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AssetList title="Shared projects" items={(projects.data ?? []).map((item) => item.name)} />
              <AssetList title="Shared chats" items={(conversations.data ?? []).map((item) => item.title)} />
              <AssetList title="Shared documents" items={(documents.data ?? []).map((item) => item.title)} />
              <AssetList title="Shared research" items={(reports.data ?? []).map((item) => item.title)} />
              <AssetList title="Shared websites" items={(websites.data ?? []).map((item) => item.title)} />
              <AssetList title="Shared code" items={(codeProjects.data ?? []).map((item) => item.title)} />
            </div>
          ) : (
            <p className="text-muted">Create or join an organization to view shared assets.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function AssetList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 6).map((item) => (
            <p key={item} className="truncate rounded-xl bg-white/[0.03] p-2 text-sm text-muted">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted">No shared assets yet.</p>
        )}
      </div>
    </div>
  );
}
