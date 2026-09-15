import { CmsRoutePage, cmsPageMetadata } from "@/src/components/cms/CmsRoutePage";

export const revalidate = 60;

export async function generateMetadata() {
  return cmsPageMetadata("projects");
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; type?: string }>;
}) {
  return <CmsRoutePage slug="projects" searchParams={searchParams} />;
}
