import { redirect } from "next/navigation";
import { OrivooAssistant } from "@/components/assistant/orivoo-assistant";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { conversationId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access your ORIVOO AI dashboard.");
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0] ?? "Operator");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id,title,model,project_id,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(30);

  const { data: projects } = await supabase
    .from("projects")
    .select("id,name")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const requestedConversation = conversationId
    ? conversations?.find((conversation) => conversation.id === conversationId)
    : null;
  const initialConversationId =
    requestedConversation?.id ?? conversations?.[0]?.id ?? null;
  const { data: messages } = initialConversationId
    ? await supabase
        .from("messages")
        .select("id,conversation_id,role,content,created_at")
        .eq("conversation_id", initialConversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <OrivooAssistant
      displayName={displayName}
      initialConversationId={initialConversationId}
      initialConversations={conversations ?? []}
      initialMessages={messages ?? []}
      initialProjects={projects ?? []}
    />
  );
}
