import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateConversation,
  listThreadMessages,
} from "@/lib/actions/conversations";
import { listProjects } from "@/lib/actions/projects";
import { getProjectStats } from "@/lib/actions/project-stats";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getUserSubscription } from "@/lib/actions/subscription";
import type { Project } from "@/lib/types/project";

/**
 * Toujours rendue à la demande : l'historique d'une conversation ne doit
 * jamais être servi depuis un cache, même bref.
 */
export const dynamic = "force-dynamic";

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

  const conversation = await getOrCreateConversation(id, "MENDLY");
  if (!conversation) {
    throw new Error("Could not create conversation");
  }

  const [messages, allProjects, usage, subscription, projectStats] = await Promise.all([
    listThreadMessages(id, "MENDLY"),
    listProjects(),
    checkRateLimit(user.id),
    getUserSubscription(),
    getProjectStats(id),
  ]);

  return (
    <ChatInterface
      // La clé force un montage neuf à chaque projet : sans elle, rien ne
      // garantit que l'état d'un projet ne survive pas dans le suivant.
      key={id}
      project={project as Project}
      conversationId={conversation.id}
      initialMessages={messages}
      locale={locale}
      initialUsageUsed={usage.used}
      initialUsageLimit={usage.limit}
      userPlan={subscription.plan}
      userEmail={user.email ?? null}
      allProjects={allProjects}
      projectStats={projectStats}
    />
  );
}