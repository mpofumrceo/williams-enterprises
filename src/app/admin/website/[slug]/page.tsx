import { getAdminPage } from "@/src/lib/data/cms";
import { PageBuilderClient } from "./PageBuilderClient";
import { notFound } from "next/navigation";

export default async function WebsitePageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getAdminPage(slug);
  if (!data) notFound();
  return <PageBuilderClient page={data.page} sections={data.sections} />;
}
