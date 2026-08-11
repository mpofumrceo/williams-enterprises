"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { GalleryItem } from "@/src/types/database";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import MediaUpload from "@/src/components/admin/MediaUpload";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { isVideoUrl } from "@/src/lib/supabase/upload";

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Hidden" },
];

function GalleryForm({ item, onDone }: { item?: GalleryItem; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = item
        ? await updateGalleryItem(item.id, formData)
        : await createGalleryItem(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(item ? "Gallery item updated" : "Gallery item created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" label="Title" defaultValue={item?.title ?? ""} />
        <Input name="category" label="Category" defaultValue={item?.category ?? ""} />
        <Input name="sort_order" label="Sort Order" type="number" defaultValue={item?.sort_order ?? 0} />
        <SelectField name="status" label="Status" defaultValue={item?.status ?? "published"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="image_url"
        label="Image or Video"
        bucket="gallery"
        folder="items"
        defaultValue={item?.image_url}
        kind="media"
        required
      />
      <Textarea name="description" label="Description" rows={2} defaultValue={item?.description ?? ""} />
      <Button type="submit" loading={pending}>{item ? "Update" : "Create"}</Button>
    </form>
  );
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkPending, startBulk] = useTransition();

  function handleBulkUpload(urls: string[]) {
    startBulk(async () => {
      let ok = 0;
      for (const url of urls) {
        const fd = new FormData();
        fd.set("title", `Gallery ${new Date().toLocaleDateString()}`);
        fd.set("image_url", url);
        fd.set("category", "Construction");
        fd.set("status", "published");
        fd.set("sort_order", "0");
        const res = await createGalleryItem(fd);
        if (!res.error) ok++;
      }
      if (ok) toast.success(`Added ${ok} gallery item${ok > 1 ? "s" : ""}`);
      else toast.error("Failed to save uploaded files");
    });
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Upload and manage gallery images or videos."
        actions={
          <>
            <Button onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Cancel" : "Add Item"}
            </Button>
            <Button variant="outline" onClick={() => setShowBulk((v) => !v)}>
              {showBulk ? "Cancel Bulk" : "Bulk Upload"}
            </Button>
          </>
        }
      />

      {showBulk && (
        <AdminCard title="Bulk Upload" className="mb-6">
          <MediaUpload
            name="bulk"
            label="Upload multiple images or videos"
            bucket="gallery"
            folder="items"
            kind="media"
            multiple
            onMultiUpload={handleBulkUpload}
          />
          {bulkPending && <p className="mt-2 text-sm text-slate-500">Saving uploaded files...</p>}
        </AdminCard>
      )}

      {showAdd && (
        <AdminCard title="Add Single Item" className="mb-6">
          <GalleryForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}

      <AdminCard title={`Gallery (${items.length})`}>
        {items.length === 0 ? (
          <EmptyState title="No gallery items" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="relative h-40 bg-slate-100">
                  {item.image_url &&
                    (isVideoUrl(item.image_url) ? (
                      <video src={item.image_url} className="h-full w-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title ?? "Gallery"} className="h-full w-full object-cover" />
                    ))}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-navy">{item.title ?? "Untitled"}</h4>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-500">{item.category}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === item.id ? null : item.id)}>
                      {editingId === item.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteGalleryItem(item.id)} />
                  </div>
                  {editingId === item.id && (
                    <div className="mt-4 border-t pt-4">
                      <GalleryForm item={item} onDone={() => setEditingId(null)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
