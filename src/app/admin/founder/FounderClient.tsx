"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Founder } from "@/src/types/database";
import { updateFounder } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

function FounderForm({ founder }: { founder: Founder }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateFounder(founder.id, formData);
      if (res.error) toast.error(res.error);
      else toast.success("Founder profile updated");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" label="Name" defaultValue={founder.name} required />
        <Input name="title" label="Title" defaultValue={founder.title ?? ""} />
      </div>
      <MediaUpload
        name="image_url"
        label="Founder Photo"
        bucket="founders"
        folder="profiles"
        defaultValue={founder.image_url}
        kind="image"
      />
      <Textarea name="biography" label="Biography" rows={8} defaultValue={founder.biography ?? ""} />
      <FormCheckbox name="is_active" label="Active on site" defaultChecked={founder.is_active} />
      <Button type="submit" loading={pending}>Save Founder Profile</Button>
    </form>
  );
}

export default function FounderClient({ founders }: { founders: Founder[] }) {
  const active = founders.find((f) => f.is_active) ?? founders[0];

  return (
    <div>
      <PageHeader title="Founder" description="Edit founder profile and photo shown on the homepage and About page." />
      <AdminCard>
        {active ? (
          <FounderForm founder={active} />
        ) : (
          <EmptyState title="No founder record" description="Add a founder record in the database." />
        )}
      </AdminCard>
    </div>
  );
}
