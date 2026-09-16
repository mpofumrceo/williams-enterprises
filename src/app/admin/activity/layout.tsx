import { requirePermission } from "@/src/lib/auth/session";

export default async function ActivityGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("activity");
  return children;
}
