import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listDeliverables } from "@/lib/actions/deliverables";
import { DeliverablesListClient } from "@/components/chat/DeliverablesListClient";
import type { Project } from "@/lib/types/project";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function DeliverablesPage({ params }: PageProps) {
  const { id } = await params;

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

  const deliverables = await listDeliverables(id);

  return (
    <DeliverablesListClient
      project={project as Project}
      deliverables={deliverables}
    />
  );
}