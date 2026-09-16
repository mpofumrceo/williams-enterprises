import { requirePermission } from "@/src/lib/auth/session";

export default async function ContactGuard({ children }: { children: React.ReactNode }) {
  await requirePermission("enquiries");
  return children;
}
