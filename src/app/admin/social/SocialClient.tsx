"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { SocialLink } from "@/src/types/database";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function SocialForm({ link, onDone }: { link?: SocialLink; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = link ? await updateSocialLink(link.id, formData) : await createSocialLink(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(link ? "Link updated" : "Link created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="platform" label="Platform" defaultValue={link?.platform} required placeholder="facebook" />
        <Input name="url" label="URL" defaultValue={link?.url} required />
        <Input name="sort_order" label="Sort Order" type="number" defaultValue={link?.sort_order ?? 0} />
      </div>
      <FormCheckbox name="is_visible" label="Visible on site" defaultChecked={link?.is_visible ?? true} />
      <Button type="submit" loading={pending}>{link ? "Update" : "Add Link"}</Button>
    </form>
  );
}

export default function SocialClient({ links }: { links: SocialLink[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Social Links"
        description="Manage social media links in the footer."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Social Link"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add Social Link" className="mb-6">
          <SocialForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Links (${links.length})`}>
        {links.length === 0 ? (
          <EmptyState title="No social links" />
        ) : (
          <div className="space-y-4">
            {links.map((l) => (
              <div key={l.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold capitalize text-navy">{l.platform}</h4>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:underline">
                      {l.url}
                    </a>
                    <p className="text-xs text-slate-400">{l.is_visible ? "Visible" : "Hidden"} · Order {l.sort_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === l.id ? null : l.id)}>
                      {editingId === l.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteSocialLink(l.id)} />
                  </div>
                </div>
                {editingId === l.id && (
                  <div className="mt-4 border-t pt-4">
                    <SocialForm link={l} onDone={() => setEditingId(null)} />
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
