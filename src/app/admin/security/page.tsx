import { createClient } from "@/src/lib/supabase/server";
import { getProfile } from "@/src/lib/auth/session";
import { isSupabaseConfigured } from "@/src/lib/supabase/env";
import { hasServiceRole } from "@/src/lib/supabase/admin";
import { ROLE_LABELS } from "@/src/lib/permissions/roles";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { StatusBadge } from "@/src/components/ui/StatusBadge";

const CONTROLS = [
  { name: "Authentication", detail: "Supabase Auth with server-side getUser() session validation" },
  { name: "Role-based access", detail: "super_admin, admin, editor (+ existing manager/staff roles)" },
  { name: "Admin route protection", detail: "Middleware + layout + per-route permission guards" },
  { name: "Row Level Security", detail: "Enabled on CMS, enquiries, profiles, logs, and storage" },
  { name: "Rate limiting", detail: "Distributed via Supabase consume_rate_limit() — login, contact, upload, AI" },
  { name: "Security headers", detail: "CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy" },
  { name: "Secure cookies", detail: "HttpOnly, SameSite=Lax, Secure in production" },
  { name: "File upload restrictions", detail: "Magic-byte checks, no SVG/HTML/executables, unique storage names" },
  { name: "Audit logging", detail: "activity_logs + security_events (no secrets stored)" },
  { name: "CSRF / origin checks", detail: "SameSite cookies, server action origin allowlist, admin mutation origin check" },
];

export default async function SecurityPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  let events: Array<{
    id: string;
    event_type: string;
    email: string | null;
    success: boolean | null;
    created_at: string;
  }> = [];
  let failedLogins = 0;

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("security_events")
      .select("id, event_type, email, success, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    events = data ?? [];
    failedLogins = events.filter(
      (event) => event.event_type === "FAILED_LOGIN" && event.created_at >= since
    ).length;
  } catch {
    events = [];
  }

  return (
    <div>
      <PageHeader
        title="Security"
        description="Operational status of authentication, access control, and hardening. Secrets are never shown here."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <AdminCard title="Signed-in user">
          <p className="text-sm font-semibold text-navy">{profile?.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {profile ? ROLE_LABELS[profile.role] : "Unknown"} · {profile?.is_active ? "Active" : "Inactive"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Last login:{" "}
            {profile?.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleString() : "This session"}
          </p>
        </AdminCard>
        <AdminCard title="Failed logins (24h)">
          <p className="text-3xl font-bold text-navy">{failedLogins}</p>
          <p className="mt-1 text-xs text-slate-500">
            {failedLogins >= 10 ? "Elevated — review events below." : "Within expected range."}
          </p>
        </AdminCard>
        <AdminCard title="Platform">
          <p className="text-sm text-slate-700">
            Supabase: {isSupabaseConfigured() ? "configured" : "missing public env"}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Service role on server: {hasServiceRole() ? "present" : "not set"}
          </p>
        </AdminCard>
      </div>

      <AdminCard title="Active controls" className="mb-6">
        <ul className="divide-y divide-slate-100">
          {CONTROLS.map((control) => (
            <li key={control.name} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-navy">{control.name}</p>
                <p className="text-xs text-slate-500">{control.detail}</p>
              </div>
              <StatusBadge status="active" />
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard title="Recent security events">
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Result</th>
                  <th className="pb-3">When</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{event.event_type}</td>
                    <td className="py-3 pr-4">{event.email ?? "—"}</td>
                    <td className="py-3 pr-4">{event.success === false ? "Failed" : event.success ? "OK" : "—"}</td>
                    <td className="py-3 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No events yet. Run <code>supabase/migrations/security_hardening.sql</code> if this table is missing.
          </p>
        )}
      </AdminCard>
    </div>
  );
}
