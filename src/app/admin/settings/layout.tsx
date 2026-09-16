import { requirePermission } from "@/src/lib/auth/session";

export default async function SettingsGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("settings");
  return children;
}
