import { createClient } from "@/src/lib/supabase/server";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Activity Logs" description="Audit trail of admin actions." />
      <AdminCard title={`Recent Activity (${logs?.length ?? 0})`}>
        {logs?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Entity</th>
                  <th className="pb-3 pr-4">Entity ID</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium capitalize">{log.action.replace(/_/g, " ")}</td>
                    <td className="py-3 pr-4">{log.entity ?? "—"}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{log.entity_id?.slice(0, 12) ?? "—"}</td>
                    <td className="py-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No activity logs" />
        )}
      </AdminCard>
    </div>
  );
}
