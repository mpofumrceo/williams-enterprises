import { CmsRoutePage, cmsPageMetadata } from "@/src/components/cms/CmsRoutePage";

export const revalidate = 60;

export async function generateMetadata() {
  return cmsPageMetadata("about");
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; type?: string }>;
}) {
  return <CmsRoutePage slug="about" searchParams={searchParams} />;
}
