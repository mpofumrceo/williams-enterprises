"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { ContactMessage, ContactSettings, SocialLink } from "@/src/types/database";
import { markContactMessageRead, updateContactSettings } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import SocialClient from "@/src/app/admin/social/SocialClient";
import { parsePhones } from "@/src/lib/utils/contact";

function ContactForm({ settings }: { settings: ContactSettings }) {
  const [pending, startTransition] = useTransition();
  const [phones, setPhones] = useState<string[]>(() => {
    const existing = parsePhones(settings.phone);
    return existing.length ? existing : [""];
  });

  function handleSubmit(formData: FormData) {
    formData.set("phone", phones.map((p) => p.trim()).filter(Boolean).join("\n"));
    startTransition(async () => {
      const res = await updateContactSettings(settings.id, formData);
      if (res.error) toast.error(res.error);
      else toast.success("Contact settings updated");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">Phone numbers</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPhones((prev) => [...prev, ""])}
          >
            <Plus size={14} /> Add number
          </Button>
        </div>
        {phones.map((phone, index) => (
          <div key={index} className="flex items-end gap-2">
            <Input
              label={index === 0 ? "Primary (shown in navbar)" : `Phone ${index + 1}`}
              value={phone}
              onChange={(e) =>
                setPhones((prev) => prev.map((item, i) => (i === index ? e.target.value : item)))
              }
              placeholder="+263..."
            />
            {phones.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-0.5 text-red-600"
                aria-label="Remove number"
                onClick={() => setPhones((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="email" label="Email" type="email" defaultValue={settings.email ?? ""} />
        <Input name="whatsapp" label="WhatsApp number or URL" defaultValue={settings.whatsapp ?? ""} />
        <Input name="map_lat" label="Map Latitude" type="number" step="any" defaultValue={settings.map_lat ?? ""} />
        <Input name="map_lng" label="Map Longitude" type="number" step="any" defaultValue={settings.map_lng ?? ""} />
        <Input name="map_zoom" label="Map Zoom" type="number" defaultValue={settings.map_zoom ?? 13} />
        <Input name="map_marker_title" label="Map marker title" defaultValue={settings.map_marker_title ?? ""} />
        <Input name="company_name" label="Company name" defaultValue={settings.company_name ?? ""} />
      </div>
      <Textarea name="address" label="Address" rows={2} defaultValue={settings.address ?? ""} />
      <Textarea name="business_hours" label="Business Hours" rows={2} defaultValue={settings.business_hours ?? ""} />
      <Textarea name="company_description" label="Company Description" rows={3} defaultValue={settings.company_description ?? ""} />
      <Button type="submit" loading={pending}>Save Contact Settings</Button>
    </form>
  );
}

function EnquiryList({ messages }: { messages: ContactMessage[] }) {
  const [pending, startTransition] = useTransition();

  function toggleRead(id: string, isRead: boolean) {
    startTransition(async () => {
      const res = await markContactMessageRead(id, isRead);
      if (res.error) toast.error(res.error);
    });
  }

  if (!messages.length) {
    return <p className="text-sm text-slate-500">No enquiries yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li key={message.id} className="rounded-2xl bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-navy">{message.full_name}</p>
              <p className="text-sm text-slate-600">{message.email}</p>
              {message.phone && <p className="text-sm text-slate-500">{message.phone}</p>}
            </div>
            <div className="flex items-center gap-2">
              {!message.is_read && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  New
                </span>
              )}
              <time className="text-xs text-slate-400">
                {new Date(message.created_at).toLocaleString()}
              </time>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{message.message}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            loading={pending}
            onClick={() => toggleRead(message.id, !message.is_read)}
          >
            {message.is_read ? "Mark unread" : "Mark read"}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default function ContactClient({
  settings,
  messages,
  socialLinks,
}: {
  settings: ContactSettings | null;
  messages: ContactMessage[];
  socialLinks: SocialLink[];
}) {
  const unread = messages.filter((message) => !message.is_read).length;

  return (
    <div>
      <PageHeader
        title="Contact, phones & social"
        description="These details appear in the navbar, footer, contact page and enquiry cards. Add extra phone numbers or social links here."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Public contact details">
          {settings ? <ContactForm settings={settings} /> : <EmptyState title="No contact settings found" />}
        </AdminCard>
        <AdminCard title={`Inbox${unread ? ` · ${unread} new` : ""}`}>
          <EnquiryList messages={messages} />
        </AdminCard>
      </div>
      <div className="mt-6">
        <SocialClient links={socialLinks} embedded />
      </div>
    </div>
  );
}
