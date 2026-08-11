import { createClient } from "@/src/lib/supabase/server";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ProjectsClient projects={projects ?? []} />;
}
