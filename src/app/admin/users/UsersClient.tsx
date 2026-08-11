"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Profile, UserRole } from "@/src/types/database";
import { updateUserRole, updateUserName, toggleUserActive } from "@/src/lib/actions/admin";
import { ROLE_LABELS, isSuperAdminEmail } from "@/src/lib/permissions/roles";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

const ROLES: UserRole[] = ["admin", "manager", "sales_manager", "staff", "user"];

function UserRow({ user }: { user: Profile }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(user.full_name ?? "");
  const locked = isSuperAdminEmail(user.email);

  function changeRole(role: string) {
    if (locked) {
      toast.error("The super admin account cannot be changed from Admin.");
      return;
    }
    startTransition(async () => {
      const res = await updateUserRole(user.id, role);
      if (res.error) toast.error(res.error);
      else toast.success("Role updated");
    });
  }

  function saveName() {
    startTransition(async () => {
      const res = await updateUserName(user.id, name);
      if (res.error) toast.error(res.error);
      else toast.success("Name updated");
    });
  }

  function toggleActive() {
    if (locked) {
      toast.error("The super admin account cannot be deactivated.");
      return;
    }
    startTransition(async () => {
      const res = await toggleUserActive(user.id, !user.is_active);
      if (res.error) toast.error(res.error);
      else toast.success(user.is_active ? "User deactivated" : "User activated");
    });
  }

  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-[200px]"
            aria-label="Full name"
          />
          <Button variant="outline" size="sm" loading={pending} onClick={saveName}>
            Save name
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-400" title="Email cannot be changed">
          {user.email} <span className="italic">(locked)</span>
          {locked && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Super Admin
            </span>
          )}
        </p>
      </td>
      <td className="py-3 pr-4">
        {locked ? (
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-medium text-navy">
            {ROLE_LABELS.admin}
          </span>
        ) : (
          <select
            defaultValue={user.role}
            disabled={pending}
            onChange={(e) => changeRole(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={user.is_active ? "active" : "inactive"} />
      </td>
      <td className="py-3 pr-4 text-xs text-slate-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="py-3">
        {locked ? (
          <span className="text-xs text-slate-400">Protected</span>
        ) : (
          <Button variant="outline" size="sm" loading={pending} onClick={toggleActive}>
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function UsersClient({ users }: { users: Profile[] }) {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Assign roles (Admin, Manager, Sales Manager, Staff). Emails are locked; names can be edited. The owner super admin cannot be demoted or deactivated."
      />
      <AdminCard title={`Users (${users.length})`}>
        {users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Name / Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
