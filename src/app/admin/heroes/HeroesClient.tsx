"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { HeroBackground } from "@/src/types/database";
import { updateHeroBackground } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  projects: "Projects",
  gallery: "Gallery",
  news: "News",
  contact: "Contact",
};

function HeroForm({ hero, onDone }: { hero: HeroBackground; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateHeroBackground(hero.id, formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Hero image saved to Supabase");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <MediaUpload
        key={`${hero.id}-desktop`}
        name="background_url"
        label="Hero image (saved to Supabase)"
        bucket="gallery"
        folder={`heroes/${hero.page_key}`}
        defaultValue={hero.background_url}
        kind="image"
      />
      <MediaUpload
        key={`${hero.id}-mobile`}
        name="mobile_background_url"
        label="Mobile hero image (optional)"
        bucket="gallery"
        folder={`heroes/${hero.page_key}/mobile`}
        defaultValue={hero.mobile_background_url}
        kind="image"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="overlay_color" label="Overlay Color" defaultValue={hero.overlay_color ?? "#0A2540"} />
        <Input
          name="overlay_opacity"
          label="Overlay Opacity (0–1)"
          type="number"
          step="0.05"
          min="0"
          max="1"
          defaultValue={hero.overlay_opacity}
        />
      </div>
      <FormCheckbox name="is_active" label="Active" defaultChecked={hero.is_active} />
      <Button type="submit" loading={pending}>
        Save hero image
      </Button>
    </form>
  );
}

export default function HeroesClient({ heroes }: { heroes: HeroBackground[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Hero Backgrounds"
        description="Upload a unique image for each page. Files are stored in Supabase and shown on the public site."
      />
      <AdminCard>
        {heroes.length === 0 ? (
          <EmptyState title="No hero backgrounds" description="Reload this page to create the default pages." />
        ) : (
          <div className="space-y-4">
            {heroes.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-navy">
                      {h.background_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.background_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-white/70">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-navy">{PAGE_LABELS[h.page_key] ?? h.page_key}</h4>
                        <StatusBadge status={h.is_active ? "active" : "inactive"} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {h.background_url ? "Image stored in Supabase" : "Upload an image to use on this page"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(editingId === h.id ? null : h.id)}
                  >
                    {editingId === h.id ? "Cancel" : "Change image"}
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
