import { requirePermission } from "@/src/lib/auth/session";

export default async function ExpensesGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("finance");
  return children;
}
