import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import { listProjects } from "@/lib/actions/projects";
import { getLastAgentActivity } from "@/lib/actions/agent-activity";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getUserSubscription } from "@/lib/actions/subscription";
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

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const conversation = await getOrCreateConversation(id, "CEO");
  if (!conversation) {
    throw new Error("Could not create conversation");
  }

  const [messages, allProjects, usage, subscription, lastAgentActivity] = await Promise.all([
    listMessages(conversation.id),
    listProjects(),
    checkRateLimit(user.id),
    getUserSubscription(),
    getLastAgentActivity(id),
  ]);

  return (
    <ChatInterface
      project={project as Project}
      conversationId={conversation.id}
      initialMessages={messages}
      locale={locale}
      initialUsageUsed={usage.used}
      initialUsageLimit={usage.limit}
      userPlan={subscription.plan}
      userEmail={user.email ?? null}
      allProjects={allProjects}
      lastAgentActivity={lastAgentActivity}
    />
  );
}