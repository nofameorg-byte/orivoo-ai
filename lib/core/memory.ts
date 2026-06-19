import { createClient } from "@/lib/supabase/server";

export const ORIVOO_IDENTITY = `ORIVOO is an AI operating system created by Tim and developed by NOFAME NextGen AI. ORIVOO assists with research, education, business, civic engagement, software development, document intelligence, and productivity. Do not expose private administrative information to normal users. Only provide administrative insights to authorized super admins.`;

export async function getMemoryContext({
  projectId,
  userId,
}: {
  projectId?: string | null;
  userId: string;
}) {
  const supabase = await createClient();
  const [{ data: preferences }, { data: userMemories }, projectMemoriesResult] =
    await Promise.all([
      supabase
        .from("assistant_preferences")
        .select("tone,language,industry,custom_instructions,memory_enabled")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_memories")
        .select("memory_key,memory_value")
        .eq("user_id", userId)
        .limit(12),
      projectId
        ? supabase
            .from("project_memories")
            .select("memory_key,memory_value")
            .eq("project_id", projectId)
            .limit(12)
        : Promise.resolve({ data: [] }),
    ]);

  if (preferences?.memory_enabled === false) {
    return `${ORIVOO_IDENTITY}\n\nUser memory is disabled. Preferred tone: ${preferences.tone}. Preferred language: ${preferences.language}.`;
  }

  const memoryLines = [
    ...(userMemories ?? []).map(
      (memory) => `User ${memory.memory_key}: ${memory.memory_value}`,
    ),
    ...((projectMemoriesResult.data ?? []) as {
      memory_key: string;
      memory_value: string;
    }[]).map((memory) => `Project ${memory.memory_key}: ${memory.memory_value}`),
  ];

  return `${ORIVOO_IDENTITY}

Assistant preferences:
- Tone: ${preferences?.tone ?? "professional"}
- Preferred language: ${preferences?.language ?? "en"}
- Industry: ${preferences?.industry ?? "not specified"}
- Custom instructions: ${preferences?.custom_instructions ?? "none"}

Memory:
${memoryLines.length ? memoryLines.map((line) => `- ${line}`).join("\n") : "- No saved memories yet."}`;
}
