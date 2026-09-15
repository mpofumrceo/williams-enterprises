"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AdminCard } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { MediaPicker } from "@/src/components/admin/MediaPicker";
import { saveSiteBranding } from "@/src/lib/actions/cms";
import type { SiteBranding } from "@/src/lib/cms/types";

export function BrandingEditor({ branding }: { branding: SiteBranding }) {
  const [pending, startTransition] = useTransition();

  return (
    <AdminCard title="Branding & default SEO" className="mb-6">
      <form
        className="grid gap-4 md:grid-cols-2"
        action={(formData) => {
          startTransition(async () => {
            const res = await saveSiteBranding(formData);
            if (res.error) toast.error(res.error);
            else toast.success("Branding saved");
          });
        }}
      >
        <input type="hidden" name="id" value={branding.id.startsWith("fallback") ? "" : branding.id} />
        <Input name="company_name" label="Company name" defaultValue={branding.company_name} />
        <Input name="tagline" label="Tagline" defaultValue={branding.tagline ?? ""} />
        <MediaPicker label="Logo" name="logo_url" value={branding.logo_url} folder="branding" />
        <MediaPicker label="Favicon" name="favicon_url" value={branding.favicon_url} folder="branding" />
        <MediaPicker label="Default OG image" name="default_og_image" value={branding.default_og_image} folder="branding" />
        <Input name="seo_title" label="Default SEO title" defaultValue={branding.seo_title ?? ""} />
        <label className="md:col-span-2 text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">Default SEO description</span>
          <textarea name="seo_description" defaultValue={branding.seo_description ?? ""} rows={3} className="input-clay w-full rounded-xl px-3 py-2" />
        </label>
        <Input name="seo_keywords" label="Keywords" defaultValue={branding.seo_keywords ?? ""} className="md:col-span-2" />
        <div className="md:col-span-2">
          <Button type="submit" loading={pending}>Save branding</Button>
        </div>
      </form>
    </AdminCard>
  );
}
