import { getAdminNavigation } from "@/src/lib/data/cms";
import { NavigationClient } from "./NavigationClient";

export default async function NavigationPage() {
  const items = await getAdminNavigation();
  return <NavigationClient items={items} />;
}
