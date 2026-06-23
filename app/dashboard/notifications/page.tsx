import { Bell } from "lucide-react";
import { getDictionary, getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type NotificationRow = {
  id: string;
  title: string;
  body?: string | null;
  notification_type: string;
  read_at?: string | null;
  created_at: string;
};

export default async function DashboardNotificationsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, notification_type, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data ?? []) as unknown as NotificationRow[];

  return (
    <section className="rounded-[2rem] border border-border bg-panel p-6">
      <h1 className="flex items-center gap-3 text-3xl font-black text-foreground">
        <Bell className="size-7 text-gold" aria-hidden />
        {t(dictionary, "notifications.title")}
      </h1>
      <div className="mt-6 grid gap-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-border bg-panel-soft p-4"
            >
              <p className="font-bold text-foreground">{notification.title}</p>
              <p className="mt-1 text-sm text-muted">{notification.body}</p>
              <p className="mt-2 text-xs font-semibold text-muted">
                {notification.notification_type}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-border bg-panel-soft p-8 text-center">
            <p className="font-bold text-foreground">
              {t(dictionary, "notifications.empty")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
