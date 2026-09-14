"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Service } from "@/src/types/database";
import { createService, updateService, deleteService } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import MediaUpload from "@/src/components/admin/MediaUpload";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { isVideoUrl } from "@/src/lib/supabase/upload";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "archived", label: "Archived" },
];

function ServiceForm({ service, onDone }: { service?: Service; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!service;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = isEdit
        ? await updateService(service.id, formData)
        : await createService(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Service updated" : "Service created");
        onDone?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" label="Name" defaultValue={service?.name} required />
        <Input name="category" label="Category" defaultValue={service?.category ?? ""} />
        <Input name="icon_name" label="Icon Name" defaultValue={service?.icon_name ?? ""} />
        <Input name="sort_order" label="Sort Order" type="number" defaultValue={service?.sort_order ?? 0} />
        <SelectField name="status" label="Status" defaultValue={service?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="image_url"
        label="Service Image or Video"
        bucket="services"
        folder="services"
        defaultValue={service?.image_url}
        kind="media"
      />
      <Input name="short_description" label="Short Description" defaultValue={service?.short_description ?? ""} />
      <Textarea name="description" label="Description" rows={3} defaultValue={service?.description ?? ""} />
      <Input name="pricing_info" label="Pricing Info" defaultValue={service?.pricing_info ?? ""} />
      <div className="flex flex-wrap gap-4">
        <FormCheckbox name="is_featured" label="Featured" defaultChecked={service?.is_featured} />
        <FormCheckbox name="is_trending" label="Trending" defaultChecked={service?.is_trending} />
        <FormCheckbox name="is_most_requested" label="Most Requested" defaultChecked={service?.is_most_requested} />
      </div>
      <Button type="submit" loading={pending}>
        {isEdit ? "Update Service" : "Create Service"}
      </Button>
    </form>
  );
}

export default function ServicesClient({ services }: { services: Service[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage construction services offered by Williams Enterprises."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Service"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add New Service" className="mb-6">
          <ServiceForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`All Services (${services.length})`}>
        {services.length === 0 ? (
          <EmptyState title="No services yet" description="Create your first service above." />
        ) : (
          <div className="space-y-4">
            {services.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    {s.image_url && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {isVideoUrl(s.image_url) ? (
                          <video src={s.image_url} className="h-full w-full object-cover" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-navy">{s.name}</h4>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{s.short_description}</p>
                      <p className="text-xs text-slate-400">{s.category} · Order: {s.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === s.id ? null : s.id)}>
                      {editingId === s.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteService(s.id)} />
                  </div>
                </div>
                {editingId === s.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <ServiceForm service={s} onDone={() => setEditingId(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
