import { requireStaff } from "@/src/lib/auth/session";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaff();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-6 py-4 print:hidden">
          <h1 className="text-lg font-semibold text-navy">Williams Enterprises Portal</h1>
        </header>
        <div className="p-6 print:p-0">{children}</div>
      </div>
    </div>
  );
}
