import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import { ChatInterface } from "@/components/chat/ChatInterface";
import type { Project } from "@/lib/types/project";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ProjectChatPage({ params }: PageProps) {
  const { id, locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch project (RLS ensures user owns it)
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Get or create the CEO conversation for this project
  const conversation = await getOrCreateConversation(id, "CEO");

  if (!conversation) {
    throw new Error("Could not create conversation");
  }

  // Load existing messages
  const messages = await listMessages(conversation.id);

  return (
    <ChatInterface
      project={project as Project}
      conversationId={conversation.id}
      initialMessages={messages}
      locale={locale}
    />
  );
}