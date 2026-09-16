import { requirePermission } from "@/src/lib/auth/session";

export default async function FooterGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("navigation");
  return children;
}
