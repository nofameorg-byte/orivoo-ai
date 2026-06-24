import type { Metadata } from "next";
import { Bell, Circle } from "lucide-react";
import { notifications } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <Bell className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Notifications
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Application, compliance, invoice, and transfer updates.
        </h1>
        <p className="mt-3 text-muted">{unreadCount} unread notifications</p>
      </section>

      <section className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[auto_1fr_auto] md:items-center"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/45">
              <Circle
                className={`size-3 ${
                  notification.unread ? "fill-gold text-gold" : "text-muted"
                }`}
                aria-hidden
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {notification.type}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {notification.title}
              </h2>
              <p className="mt-2 leading-6 text-muted">{notification.body}</p>
            </div>
            <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
              {notification.unread ? "Unread" : "Read"}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
