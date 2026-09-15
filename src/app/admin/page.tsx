import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import {
  Wrench,
  FolderKanban,
  Star,
  Mail,
  FileText,
  ArrowRight,
  Inbox,
  Landmark,
  CheckCircle2,
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
    "gallery_items",
    "news_articles",
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
    gallery: results[6].count ?? 0,
    news: results[7].count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const counts = await getCounts();

  const [
    { data: recentActivity },
    { count: pendingReviews },
    { count: enquiries },
    { count: unreadEnquiries },
    { count: investorInterest },
    { count: completedProjects },
    { count: publishedProjects },
    { data: recentMessages },
  ] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("id, action, entity, entity_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).ilike("message", "%Investor inquiry%"),
    supabase.from("projects").select("*", { count: "exact", head: true }).ilike("project_status", "%complet%"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("contact_messages")
      .select("id, full_name, email, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const kpis = [
    { label: "Published projects", value: publishedProjects ?? 0, href: "/admin/projects", icon: FolderKanban },
    { label: "New enquiries", value: unreadEnquiries ?? 0, href: "/admin/contact", icon: Inbox },
    { label: "Investor interest", value: investorInterest ?? 0, href: "/admin/contact", icon: Landmark },
    { label: "Completed projects", value: completedProjects ?? 0, href: "/admin/projects", icon: CheckCircle2 },
    { label: "Services", value: counts.services, href: "/admin/services", icon: Wrench },
    { label: "Testimonials", value: counts.reviews, href: "/admin/reviews", icon: Star },
    { label: "Subscribers", value: counts.subscribers, href: "/admin/newsletter", icon: Mail },
    { label: "Quotations", value: counts.quotations, href: "/admin/quotations", icon: FileText },
  ];

  const quickLinks = [
    { href: "/admin/contact", label: "Review enquiries" },
    { href: "/admin/services", label: "Manage services" },
    { href: "/admin/projects", label: "Manage projects" },
    { href: "/admin/quotations", label: "Create quotation" },
    { href: "/admin/reviews", label: "Moderate reviews" },
    { href: "/admin/heroes", label: "Hero backgrounds" },
    { href: "/admin/miwilly", label: "Stebo Ai knowledge" },
    { href: "/admin/settings", label: "Site settings" },
  ];

  return (
    <div>
      <PageHeader
        title="Command overview"
        description="Live counts from Williams Enterprises content and enquiries."
      />

      {pendingReviews !== null && pendingReviews > 0 && (
        <AdminCard className="mb-6 border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>{pendingReviews}</strong> review{pendingReviews !== 1 ? "s" : ""} awaiting moderation.{" "}
            <Link href="/admin/reviews" className="font-semibold underline">
              Review now
            </Link>
          </p>
        </AdminCard>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, href, icon: Icon }) => (
          <Link key={`${href}-${label}`} href={href}>
            <AdminCard className="transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-navy">{value}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Recent enquiries">
          {recentMessages?.length ? (
            <ul className="space-y-3">
              {recentMessages.map((message) => (
                <li key={message.id} className="border-b border-navy/5 pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{message.full_name}</p>
                      <p className="text-xs text-slate-500">{message.email}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{message.message}</p>
                    </div>
                    {!message.is_read && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        New
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No enquiries yet.</p>
          )}
          <Link
            href="/admin/contact"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700"
          >
            Open inbox ({enquiries ?? 0}) <ArrowRight className="h-4 w-4" />
          </Link>
        </AdminCard>

        <AdminCard title="Recent activity">
          {recentActivity?.length ? (
            <ul className="space-y-3">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex items-start justify-between border-b border-navy/5 pb-3 last:border-0">
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
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700"
          >
            View all activity <ArrowRight className="h-4 w-4" />
          </Link>
        </AdminCard>

        <AdminCard title="Quick links">
          <ul className="space-y-2">
            {quickLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white/60"
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
