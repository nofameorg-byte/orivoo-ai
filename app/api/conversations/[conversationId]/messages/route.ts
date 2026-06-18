import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id,conversation_id,role,content,created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json(
      { error: "Could not load messages." },
      { status: 500 },
    );
  }

  return NextResponse.json({ messages });
}
