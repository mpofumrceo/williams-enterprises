import { getAdminMedia } from "@/src/lib/data/cms";
import { MediaLibraryClient } from "./MediaLibraryClient";

export default async function MediaPage() {
  const items = await getAdminMedia();
  return <MediaLibraryClient items={items} />;
}
