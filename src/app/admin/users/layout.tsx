import { requirePermission } from "@/src/lib/auth/session";

export default async function UsersGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("users");
  return children;
}
