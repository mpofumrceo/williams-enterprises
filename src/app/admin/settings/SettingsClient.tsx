"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { SiteSetting } from "@/src/types/database";
import { updateSiteSetting } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function SettingRow({ setting }: { setting: SiteSetting }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const value = formData.get("value") as string;
      const res = await updateSiteSetting(setting.key, value);
      if (res.error) toast.error(res.error);
      else toast.success(`${setting.key} updated`);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3 border-b border-slate-100 py-4 last:border-0">
      <div className="min-w-[140px]">
        <p className="text-sm font-medium text-navy">{setting.key}</p>
        <p className="text-xs text-slate-400">Updated {new Date(setting.updated_at).toLocaleDateString()}</p>
      </div>
      <div className="flex-1 min-w-[200px]">
        <Input name="value" defaultValue={setting.value ?? ""} />
      </div>
      <Button type="submit" size="sm" loading={pending}>Save</Button>
    </form>
  );
}

function AddSettingForm({ onDone }: { onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const key = formData.get("key") as string;
      const value = formData.get("value") as string;
      const res = await updateSiteSetting(key, value);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Setting added");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Input name="key" label="Key" placeholder="site_name" required className="min-w-[160px]" />
      <Input name="value" label="Value" placeholder="Williams Enterprises" required className="flex-1 min-w-[200px]" />
      <Button type="submit" loading={pending}>Add Setting</Button>
    </form>
  );
}

export default function SettingsClient({ settings }: { settings: SiteSetting[] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Manage global site configuration."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Setting"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add New Setting" className="mb-6">
          <AddSettingForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Settings (${settings.length})`}>
        {settings.length === 0 ? (
          <EmptyState title="No settings configured" />
        ) : (
          settings.map((s) => <SettingRow key={s.id} setting={s} />)
        )}
      </AdminCard>
    </div>
  );
}
