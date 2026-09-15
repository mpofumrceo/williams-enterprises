import { getAdminTheme } from "@/src/lib/data/cms";
import { ThemeEditorClient } from "./ThemeEditorClient";

export default async function ThemePage() {
  const theme = await getAdminTheme();
  return <ThemeEditorClient theme={theme} />;
}
