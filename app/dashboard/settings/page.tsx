import { redirect } from "next/navigation";
import { Bell, Brain, Settings, User } from "lucide-react";
import {
  saveUserMemory,
  updateNotificationPreferences,
  updateUserSettings,
} from "@/app/actions/settings";
import { createClient } from "@/lib/supabase/server";
import { supportedLanguages } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/dictionaries";

type SettingsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to manage settings.");
  }

  const [
    { data: profile },
    { data: preferences },
    { data: notificationPreferences },
    { data: memories },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,language,theme")
      .eq("id", user.id)
      .single(),
    supabase
      .from("assistant_preferences")
      .select("tone,language,industry,custom_instructions,memory_enabled")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("notification_preferences")
      .select(
        "in_app_enabled,research_completion,website_generation,code_generation,document_processing,admin_announcements",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_memories")
      .select("id,memory_key,memory_value,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);
  const t = createTranslator(profile?.language);

  return (
    <div id="settings" className="space-y-8">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
          <Settings className="size-4" aria-hidden />
          {t("settings.title")}
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          {t("settings.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-muted">{t("settings.subtitle")}</p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <form action={updateUserSettings} className="surface-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <User className="size-6 text-gold" aria-hidden />
            <h2 className="text-2xl font-semibold text-white">
              Profile and AI preferences
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-white">Display name</span>
              <input
                name="displayName"
                defaultValue={profile?.display_name ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Theme</span>
              <select
                name="theme"
                defaultValue={profile?.theme ?? "dark"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              >
                <option value="dark">Black / Gold</option>
                <option value="contrast">High contrast</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Language</span>
              <select
                name="language"
                defaultValue={profile?.language ?? "en"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              >
                {supportedLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">AI tone</span>
              <select
                name="tone"
                defaultValue={preferences?.tone ?? "professional"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              >
                <option value="professional">Professional</option>
                <option value="concise">Concise</option>
                <option value="strategic">Strategic</option>
                <option value="warm">Warm</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-white">Industry</span>
            <input
              name="industry"
              defaultValue={preferences?.industry ?? ""}
              placeholder="Business, nonprofit, civic, education..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-white">
              Custom instructions
            </span>
            <textarea
              name="customInstructions"
              defaultValue={preferences?.custom_instructions ?? ""}
              className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
          </label>
          <label className="mt-4 flex items-center gap-3 text-sm text-white">
            <input
              type="checkbox"
              name="memoryEnabled"
              defaultChecked={preferences?.memory_enabled ?? true}
            />
            Enable memory across ORIVOO studios
          </label>
          <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gold-bright">
            {t("common.save")}
          </button>
        </form>

        <section className="space-y-6">
          <form action={saveUserMemory} className="surface-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Brain className="size-6 text-gold" aria-hidden />
              <h2 className="text-2xl font-semibold text-white">
                Memory preferences
              </h2>
            </div>
            <input
              name="memoryKey"
              placeholder="business_goal"
              className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
            <textarea
              name="memoryValue"
              placeholder="What should ORIVOO remember?"
              className="mt-3 min-h-24 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
            <button className="mt-3 rounded-full border border-gold/35 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold-bright">
              Save memory
            </button>
            <div className="mt-5 space-y-2">
              {(memories ?? []).map((memory) => (
                <div
                  key={memory.id}
                  className="rounded-2xl border border-white/10 bg-black/35 p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {memory.memory_key}
                  </p>
                  <p className="mt-1 text-sm text-muted">{memory.memory_value}</p>
                </div>
              ))}
            </div>
          </form>

          <form
            action={updateNotificationPreferences}
            className="surface-card rounded-[2rem] p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <Bell className="size-6 text-gold" aria-hidden />
              <h2 className="text-2xl font-semibold text-white">
                Notification preferences
              </h2>
            </div>
            {[
              ["inAppEnabled", "In-app notifications", notificationPreferences?.in_app_enabled ?? true],
              ["researchCompletion", "Research completion", notificationPreferences?.research_completion ?? true],
              ["websiteGeneration", "Website generation completion", notificationPreferences?.website_generation ?? true],
              ["codeGeneration", "Code generation completion", notificationPreferences?.code_generation ?? true],
              ["documentProcessing", "Document processing completion", notificationPreferences?.document_processing ?? true],
              ["adminAnnouncements", "Admin announcements", notificationPreferences?.admin_announcements ?? true],
            ].map(([name, label, checked]) => (
              <label key={String(name)} className="mt-3 flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  name={String(name)}
                  defaultChecked={Boolean(checked)}
                />
                {label}
              </label>
            ))}
            <button className="mt-5 rounded-full border border-gold/35 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold-bright">
              Save notifications
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
