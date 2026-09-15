import { CmsRoutePage, cmsPageMetadata } from "@/src/components/cms/CmsRoutePage";

export const revalidate = 60;

export async function generateMetadata() {
  return cmsPageMetadata("investors");
}

export default async function InvestorsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; type?: string }>;
}) {
  return <CmsRoutePage slug="investors" searchParams={searchParams} />;
}
