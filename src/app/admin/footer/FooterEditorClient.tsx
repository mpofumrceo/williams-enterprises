"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { MediaPicker } from "@/src/components/admin/MediaPicker";
import { saveFooterSettings } from "@/src/lib/actions/cms";
import type { FooterSettings } from "@/src/lib/cms/types";

export function FooterEditorClient({ footer }: { footer: FooterSettings }) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <PageHeader title="Footer" description="Logo, description, copyright and footer call to action." />
      <AdminCard>
        <form
          className="grid gap-4"
          action={(formData) => {
            startTransition(async () => {
              const res = await saveFooterSettings(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Footer saved");
            });
          }}
        >
          <input type="hidden" name="id" value={footer.id.startsWith("fallback") ? "" : footer.id} />
          <MediaPicker label="Footer logo" name="logo_url" value={footer.logo_url} folder="branding" />
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">Description</span>
            <textarea name="description" defaultValue={footer.description ?? ""} rows={4} className="input-clay w-full rounded-xl px-3 py-2" />
          </label>
          <Input name="copyright" label="Copyright" defaultValue={footer.copyright ?? ""} />
          <Input name="column_title" label="Links column title" defaultValue={footer.column_title ?? "Navigate"} />
          <Input name="cta_text" label="CTA text" defaultValue={footer.cta_text ?? ""} />
          <Input name="cta_url" label="CTA URL" defaultValue={footer.cta_url ?? "/contact"} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_newsletter" defaultChecked={footer.show_newsletter} />
            Show newsletter signup
          </label>
          <Button type="submit" loading={pending}>Save footer</Button>
        </form>
      </AdminCard>
    </div>
  );
}
