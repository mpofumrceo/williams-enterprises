import { requirePermission } from "@/src/lib/auth/session";

export default async function EmployeesGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("hr");
  return children;
}
