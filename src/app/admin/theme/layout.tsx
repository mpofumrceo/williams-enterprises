import { requirePermission } from "@/src/lib/auth/session";

export default async function ThemeGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("design");
  return children;
}
