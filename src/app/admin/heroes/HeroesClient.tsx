"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { HeroBackground } from "@/src/types/database";
import { updateHeroBackground } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

const TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "url", label: "URL" },
];

function HeroForm({ hero, onDone }: { hero: HeroBackground; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateHeroBackground(hero.id, formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Hero background updated");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-slate-600">Page: <span className="capitalize text-navy">{hero.page_key}</span></p>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField name="background_type" label="Background Type" defaultValue={hero.background_type} options={TYPE_OPTIONS} />
        <Input name="overlay_color" label="Overlay Color" defaultValue={hero.overlay_color ?? "#0A2540"} />
        <Input name="overlay_opacity" label="Overlay Opacity" type="number" step="0.05" min="0" max="1" defaultValue={hero.overlay_opacity} />
      </div>
      <MediaUpload
        name="background_url"
        label="Desktop Background (image/video or paste URL)"
        bucket="gallery"
        folder="heroes"
        defaultValue={hero.background_url}
        kind="media"
      />
      <MediaUpload
        name="mobile_background_url"
        label="Mobile Background (optional)"
        bucket="gallery"
        folder="heroes-mobile"
        defaultValue={hero.mobile_background_url}
        kind="media"
      />
      <FormCheckbox name="is_active" label="Active" defaultChecked={hero.is_active} />
      <Button type="submit" loading={pending}>Save</Button>
    </form>
  );
}

export default function HeroesClient({ heroes }: { heroes: HeroBackground[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Hero Backgrounds" description="Configure hero backgrounds for each page." />
      <AdminCard>
        {heroes.length === 0 ? (
          <EmptyState title="No hero backgrounds" />
        ) : (
          <div className="space-y-4">
            {heroes.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold capitalize text-navy">{h.page_key}</h4>
                    <StatusBadge status={h.is_active ? "active" : "inactive"} />
                    <span className="text-xs text-slate-500">{h.background_type}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === h.id ? null : h.id)}>
                    {editingId === h.id ? "Cancel" : "Edit"}
                  </Button>
                </div>
                {editingId === h.id && (
                  <div className="mt-4 border-t pt-4">
                    <HeroForm hero={h} onDone={() => setEditingId(null)} />
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
