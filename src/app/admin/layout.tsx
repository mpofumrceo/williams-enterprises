import { requireStaff } from "@/src/lib/auth/session";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaff();

  return (
    <div className="admin-clay flex min-h-screen">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-40 print:hidden">
          <div className="panel-clay mx-4 mt-4 rounded-2xl px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Operations</p>
            <h1 className="text-lg font-semibold text-navy">Williams Enterprises command center</h1>
          </div>
        </header>
        <div className="p-6 print:p-0">{children}</div>
      </div>
    </div>
  );
}
