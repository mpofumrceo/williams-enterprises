import { CmsRoutePage, cmsPageMetadata } from "@/src/components/cms/CmsRoutePage";

export const revalidate = 60;

export async function generateMetadata() {
  return cmsPageMetadata("services");
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; type?: string }>;
}) {
  return <CmsRoutePage slug="services" searchParams={searchParams} />;
}
