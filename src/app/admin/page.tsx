import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import {
  Wrench,
  FolderKanban,
  Star,
  Users,
  Mail,
  FileText,
  ArrowRight,
} from "lucide-react";

async function getCounts() {
  const supabase = await createClient();
  const tables = [
    "services",
    "projects",
    "reviews",
    "employees",
    "newsletter_subscribers",
    "quotations",
  ] as const;

  const results = await Promise.all(
    tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true }))
  );

  return {
    services: results[0].count ?? 0,
    projects: results[1].count ?? 0,
    reviews: results[2].count ?? 0,
    employees: results[3].count ?? 0,
    subscribers: results[4].count ?? 0,
    quotations: results[5].count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const counts = await getCounts();

  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select("id, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const { count: pendingReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const kpis = [
    { label: "Services", value: counts.services, href: "/admin/services", icon: Wrench, color: "text-amber-600" },
    { label: "Projects", value: counts.projects, href: "/admin/projects", icon: FolderKanban, color: "text-blue-600" },
    { label: "Reviews", value: counts.reviews, href: "/admin/reviews", icon: Star, color: "text-yellow-600" },
    { label: "Employees", value: counts.employees, href: "/admin/employees", icon: Users, color: "text-green-600" },
    { label: "Subscribers", value: counts.subscribers, href: "/admin/newsletter", icon: Mail, color: "text-purple-600" },
    { label: "Quotations", value: counts.quotations, href: "/admin/quotations", icon: FileText, color: "text-navy" },
  ];

  const quickLinks = [
    { href: "/admin/services", label: "Manage Services" },
    { href: "/admin/projects", label: "Manage Projects" },
    { href: "/admin/quotations", label: "Create Quotation" },
    { href: "/admin/reviews", label: "Moderate Reviews" },
    { href: "/admin/miwilly", label: "Stebo Ai Knowledge" },
    { href: "/admin/settings", label: "Site Settings" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of Williams Enterprises portal activity and content."
      />

      {pendingReviews !== null && pendingReviews > 0 && (
        <AdminCard className="mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            <strong>{pendingReviews}</strong> review{pendingReviews !== 1 ? "s" : ""} awaiting moderation.{" "}
            <Link href="/admin/reviews" className="font-semibold underline">
              Review now
            </Link>
          </p>
        </AdminCard>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, href, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <AdminCard className="transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-navy">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Recent Activity">
          {recentActivity?.length ? (
            <ul className="space-y-3">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500">
                      {log.entity ?? "system"} {log.entity_id ? `· ${log.entity_id.slice(0, 8)}` : ""}
                    </p>
                  </div>
                  <time className="text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No activity yet.</p>
          )}
          <Link
            href="/admin/activity"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View all activity <ArrowRight className="h-4 w-4" />
          </Link>
        </AdminCard>

        <AdminCard title="Quick Links">
          <ul className="space-y-2">
            {quickLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {label}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
