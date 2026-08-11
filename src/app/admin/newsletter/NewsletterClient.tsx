"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { NewsletterSubscriber } from "@/src/types/database";
import { deactivateSubscriber, deleteSubscriber } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function SubscriberActions({ sub }: { sub: NewsletterSubscriber }) {
  const [pending, startTransition] = useTransition();

  function deactivate() {
    startTransition(async () => {
      const res = await deactivateSubscriber(sub.id);
      if (res.error) toast.error(res.error);
      else toast.success("Subscriber deactivated");
    });
  }

  return (
    <div className="flex gap-2">
      {sub.is_active && (
        <Button variant="outline" size="sm" loading={pending} onClick={deactivate}>
          Deactivate
        </Button>
      )}
      <DeleteButton onDelete={() => deleteSubscriber(sub.id)} />
    </div>
  );
}

export default function NewsletterClient({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  const active = subscribers.filter((s) => s.is_active).length;

  return (
    <div>
      <PageHeader title="Newsletter" description="Manage newsletter subscribers." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-navy">{subscribers.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-slate-600">{subscribers.length - active}</p>
        </AdminCard>
      </div>
      <AdminCard title="Subscribers">
        {subscribers.length === 0 ? (
          <EmptyState title="No subscribers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Subscribed</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{s.email}</td>
                    <td className="py-3 pr-4">{s.name ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={s.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {new Date(s.subscribed_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <SubscriberActions sub={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
