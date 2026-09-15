import { CmsRoutePage, cmsPageMetadata } from "@/src/components/cms/CmsRoutePage";

export const revalidate = 60;

export async function generateMetadata() {
  return cmsPageMetadata("contact");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; type?: string }>;
}) {
  return <CmsRoutePage slug="contact" searchParams={searchParams} />;
}
