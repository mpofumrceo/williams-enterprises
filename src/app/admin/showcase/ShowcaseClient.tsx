"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { HomeShowcaseItem, HomeShowcaseSettings } from "@/src/types/database";
import {
  createShowcaseItem,
  updateShowcaseItem,
  deleteShowcaseItem,
  updateShowcaseSettings,
} from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import MediaUpload from "@/src/components/admin/MediaUpload";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { isVideoUrl } from "@/src/lib/utils/media";

function SettingsForm({ settings }: { settings: HomeShowcaseSettings }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateShowcaseSettings(settings.id, formData);
      if (res.error) toast.error(res.error);
      else toast.success("Showcase settings saved");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormCheckbox name="is_enabled" label="Show showcase on homepage" defaultChecked={settings.is_enabled} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="eyebrow" label="Eyebrow" defaultValue={settings.eyebrow ?? ""} />
        <Input name="heading" label="Heading" defaultValue={settings.heading ?? ""} />
      </div>
      <Textarea name="description" label="Description" rows={3} defaultValue={settings.description ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="cta_label" label="Button label" defaultValue={settings.cta_label ?? ""} />
        <Input name="cta_url" label="Button URL" defaultValue={settings.cta_url ?? ""} />
      </div>
      <Button type="submit" loading={pending}>
        Save settings
      </Button>
    </form>
  );
}

function ItemForm({ item, onDone }: { item?: HomeShowcaseItem; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = item ? await updateShowcaseItem(item.id, formData) : await createShowcaseItem(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(item ? "Slide updated" : "Slide added");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="title" label="Title" defaultValue={item?.title} required />
      <Textarea name="caption" label="Caption" rows={2} defaultValue={item?.caption ?? ""} />
      <MediaUpload
        name="media_url"
        label="Image or video"
        bucket="gallery"
        folder="showcase"
        defaultValue={item?.media_url}
        kind="media"
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          name="media_type"
          label="Media type"
          defaultValue={item?.media_type ?? "image"}
          options={[
            { value: "image", label: "Image" },
            { value: "video", label: "Video" },
          ]}
        />
        <Input name="sort_order" label="Sort order" type="number" defaultValue={item?.sort_order ?? 0} />
      </div>
      <FormCheckbox name="is_active" label="Active on homepage" defaultChecked={item?.is_active ?? true} />
      <Button type="submit" loading={pending}>
        {item ? "Update slide" : "Add slide"}
      </Button>
    </form>
  );
}

export default function ShowcaseClient({
  settings,
  items,
}: {
  settings: HomeShowcaseSettings | null;
  items: HomeShowcaseItem[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Homepage Showcase"
        description="Choose the media and copy that appear in the homepage video showcase between the hero and the rest of the site."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Cancel" : "Add slide"}</Button>
        }
      />

      {settings ? (
        <AdminCard title="Section settings" className="mb-6">
          <SettingsForm settings={settings} />
        </AdminCard>
      ) : (
        <AdminCard className="mb-6">
          <EmptyState
            title="Showcase table not ready"
            description="Run supabase/migrations/home_showcase.sql in the Supabase SQL Editor first."
          />
        </AdminCard>
      )}

      {showAdd && (
        <AdminCard title="Add showcase slide" className="mb-6">
          <ItemForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}

      <AdminCard title={`Slides (${items.length})`}>
        {items.length === 0 ? (
          <EmptyState title="No slides yet" description="Add images or videos to feature on the homepage." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="h-24 w-36 overflow-hidden rounded-lg bg-slate-100">
                    {item.media_type === "video" || isVideoUrl(item.media_url) ? (
                      <video src={item.media_url} className="h-full w-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.media_url} alt={item.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-navy">{item.title}</h4>
                      <StatusBadge status={item.is_active ? "active" : "inactive"} />
                      <span className="text-xs text-slate-400">Order {item.sort_order}</span>
                    </div>
                    {item.caption && <p className="mt-1 text-sm text-slate-600">{item.caption}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    >
                      {editingId === item.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteShowcaseItem(item.id)} />
                  </div>
                </div>
                {editingId === item.id && (
                  <div className="mt-4 border-t pt-4">
                    <ItemForm item={item} onDone={() => setEditingId(null)} />
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
