"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ContactSettings } from "@/src/types/database";
import { updateContactSettings } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function ContactForm({ settings }: { settings: ContactSettings }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateContactSettings(settings.id, formData);
      if (res.error) toast.error(res.error);
      else toast.success("Contact settings updated");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="phone" label="Phone" defaultValue={settings.phone ?? ""} />
        <Input name="email" label="Email" type="email" defaultValue={settings.email ?? ""} />
        <Input name="whatsapp" label="WhatsApp URL" defaultValue={settings.whatsapp ?? ""} />
        <Input name="map_lat" label="Map Latitude" type="number" step="any" defaultValue={settings.map_lat ?? ""} />
        <Input name="map_lng" label="Map Longitude" type="number" step="any" defaultValue={settings.map_lng ?? ""} />
        <Input name="map_zoom" label="Map Zoom" type="number" defaultValue={settings.map_zoom ?? 13} />
      </div>
      <Textarea name="address" label="Address" rows={2} defaultValue={settings.address ?? ""} />
      <Textarea name="business_hours" label="Business Hours" rows={2} defaultValue={settings.business_hours ?? ""} />
      <Textarea name="company_description" label="Company Description" rows={3} defaultValue={settings.company_description ?? ""} />
      <Button type="submit" loading={pending}>Save Contact Settings</Button>
    </form>
  );
}

export default function ContactClient({ settings }: { settings: ContactSettings | null }) {
  return (
    <div>
      <PageHeader title="Contact Settings" description="Manage contact information displayed on the site." />
      <AdminCard>
        {settings ? <ContactForm settings={settings} /> : <EmptyState title="No contact settings found" />}
      </AdminCard>
    </div>
  );
}
