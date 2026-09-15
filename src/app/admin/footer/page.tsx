import { getAdminFooter } from "@/src/lib/data/cms";
import { FooterEditorClient } from "./FooterEditorClient";

export default async function FooterPage() {
  const footer = await getAdminFooter();
  return <FooterEditorClient footer={footer} />;
}
