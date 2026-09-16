import { requirePermission } from "@/src/lib/auth/session";

export default async function MediaGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("media");
  return children;
}
