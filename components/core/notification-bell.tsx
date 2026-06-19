"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/app/actions/settings";
import { useI18n } from "@/lib/i18n/language-provider";

export type NotificationItem = {
  body: string;
  created_at: string;
  id: string;
  is_read: boolean;
  notification_type: string;
  title: string;
};

export function NotificationBell({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative rounded-full border border-white/10 p-2 text-muted transition hover:text-white"
      >
        <Bell className="size-4" aria-hidden />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
            {unreadCount}
          </span>
        ) : null}
        <span className="sr-only">{t("notifications.title")}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-white/10 bg-panel p-4 shadow-2xl shadow-black/50">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-white">{t("notifications.title")}</p>
            <form action={markNotificationsRead}>
              <button className="text-xs text-gold-bright">Mark read</button>
            </form>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-2xl border border-white/10 bg-black/35 p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {notification.body}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted">
                {t("notifications.empty")}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
