import { requirePermission } from "@/src/lib/auth/session";

export default async function SecurityGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("security");
  return children;
}
