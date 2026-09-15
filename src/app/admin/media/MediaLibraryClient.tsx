"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { deleteMediaItem, updateMediaItem, uploadCmsMedia } from "@/src/lib/actions/cms";
import type { MediaLibraryItem } from "@/src/lib/cms/types";

export function MediaLibraryClient({ items }: { items: MediaLibraryItem[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <PageHeader title="Media library" description="Upload, caption and categorize website images and videos." />
      <AdminCard className="mb-6">
        <form
          className="flex flex-wrap items-end gap-3"
          action={(formData) => {
            startTransition(async () => {
              const res = await uploadCmsMedia(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Uploaded");
            });
          }}
        >
          <Input name="folder" label="Folder" defaultValue="uploads" />
          <Input name="category" label="Category" defaultValue="general" />
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">File</span>
            <input type="file" name="file" accept="image/*,video/*" required className="text-sm" />
          </label>
          <Button type="submit" loading={pending}>Upload</Button>
        </form>
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <form
            key={item.id}
            className="panel-clay overflow-hidden rounded-3xl"
            action={(formData) => {
              startTransition(async () => {
                const res = await updateMediaItem(formData);
                if (res.error) toast.error(res.error);
                else toast.success("Updated");
              });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt_text ?? ""} className="h-40 w-full object-cover" />
            <div className="space-y-3 p-4">
              <input type="hidden" name="id" value={item.id} />
              <Input name="title" label="Title" defaultValue={item.title ?? ""} />
              <Input name="alt_text" label="Alt text" defaultValue={item.alt_text ?? ""} />
              <Input name="category" label="Category" defaultValue={item.category ?? ""} />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save</Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm("Remove this media record? The file in storage is not deleted.")) {
                      startTransition(async () => {
                        await deleteMediaItem(item.id);
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
