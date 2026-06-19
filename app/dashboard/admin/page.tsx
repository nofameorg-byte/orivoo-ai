import { BarChart3, Database, Megaphone, Shield } from "lucide-react";
import { createAdminAnnouncement } from "@/app/actions/settings";
import { requireSuperAdmin } from "@/lib/core/auth";

type AdminPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { message } = await searchParams;
  const { supabase } = await requireSuperAdmin();
  const [
    users,
    projects,
    conversations,
    documents,
    reports,
    websites,
    codeProjects,
    messages,
  ] = await Promise.all([
    supabase.from("profiles").select("id,display_name,language,is_super_admin,created_at"),
    supabase.from("projects").select("id,name,status,created_at"),
    supabase.from("conversations").select("id,title,created_at"),
    supabase.from("documents").select("id,title,file_size,status,created_at"),
    supabase.from("research_reports").select("id,title,topic,created_at"),
    supabase.from("website_projects").select("id,title,status,created_at"),
    supabase.from("code_projects").select("id,title,framework,language,created_at"),
    supabase.from("messages").select("id,role,created_at"),
  ]);

  const storageBytes = (documents.data ?? []).reduce(
    (sum, document) => sum + (document.file_size ?? 0),
    0,
  );
  const stats = [
    ["Users", users.data?.length ?? 0],
    ["Projects", projects.data?.length ?? 0],
    ["Chats", conversations.data?.length ?? 0],
    ["Documents", documents.data?.length ?? 0],
    ["Reports", reports.data?.length ?? 0],
    ["Websites", websites.data?.length ?? 0],
    ["Code projects", codeProjects.data?.length ?? 0],
    ["AI messages", messages.data?.length ?? 0],
  ];

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
          <Shield className="size-4" aria-hidden />
          Super Admin
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          ORIVOO System Admin
        </h1>
        <p className="mt-4 max-w-3xl text-muted">
          Role-based operational visibility for authorized ORIVOO owners.
        </p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <BarChart3 className="mb-5 size-6 text-gold" aria-hidden />
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <Database className="mb-5 size-6 text-gold" aria-hidden />
          <p className="text-sm text-muted">Storage</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatBytes(storageBytes)}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <form action={createAdminAnnouncement} className="surface-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Megaphone className="size-6 text-gold" aria-hidden />
            <h2 className="text-2xl font-semibold text-white">
              Admin announcement
            </h2>
          </div>
          <input
            name="title"
            placeholder="Announcement title"
            className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
          />
          <textarea
            name="body"
            placeholder="Message to all users"
            className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
          />
          <button className="mt-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gold-bright">
            Create announcement
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Users and studio inventory
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <AdminList
              title="Users"
              items={(users.data ?? []).map((user) => ({
                id: user.id,
                label: user.display_name ?? user.id,
                meta: `${user.language} ${user.is_super_admin ? "· super admin" : ""}`,
              }))}
            />
            <AdminList
              title="Projects"
              items={(projects.data ?? []).map((project) => ({
                id: project.id,
                label: project.name,
                meta: project.status,
              }))}
            />
            <AdminList
              title="Chats"
              items={(conversations.data ?? []).map((conversation) => ({
                id: conversation.id,
                label: conversation.title,
                meta: conversation.created_at,
              }))}
            />
            <AdminList
              title="Documents"
              items={(documents.data ?? []).map((document) => ({
                id: document.id,
                label: document.title,
                meta: document.status,
              }))}
            />
            <AdminList
              title="Research"
              items={(reports.data ?? []).map((report) => ({
                id: report.id,
                label: report.title,
                meta: report.topic,
              }))}
            />
            <AdminList
              title="Websites"
              items={(websites.data ?? []).map((website) => ({
                id: website.id,
                label: website.title,
                meta: website.status,
              }))}
            />
            <AdminList
              title="Code"
              items={(codeProjects.data ?? []).map((project) => ({
                id: project.id,
                label: project.title,
                meta: `${project.language} · ${project.framework}`,
              }))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminList({
  items,
  title,
}: {
  items: { id: string; label: string; meta: string }[];
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {items.length ? (
          items.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-2xl bg-white/[0.03] p-3">
              <p className="truncate text-sm font-medium text-white">
                {item.label}
              </p>
              <p className="mt-1 truncate text-xs text-muted">{item.meta}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No records yet.</p>
        )}
      </div>
    </div>
  );
}
