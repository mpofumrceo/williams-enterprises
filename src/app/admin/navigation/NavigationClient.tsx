"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { deleteNavigationItem, saveNavigationItem } from "@/src/lib/actions/cms";
import type { NavigationItem } from "@/src/lib/cms/types";

export function NavigationClient({ items }: { items: NavigationItem[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Manage public menu items. Admin and portal routes cannot be added here."
      />
      <AdminCard title="Add menu item" className="mb-6">
        <form
          className="grid gap-3 md:grid-cols-5"
          action={(formData) => {
            formData.set("is_enabled", "on");
            startTransition(async () => {
              const res = await saveNavigationItem(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Menu item added");
            });
          }}
        >
          <Input name="label" label="Label" required />
          <Input name="url" label="URL" placeholder="/about" required />
          <SelectField
            name="location"
            label="Location"
            defaultValue="both"
            options={[
              { value: "header", label: "Header" },
              { value: "footer", label: "Footer" },
              { value: "both", label: "Both" },
            ]}
          />
          <Input name="sort_order" label="Order" defaultValue={String(items.length + 1)} />
          <div className="flex items-end">
            <Button type="submit" loading={pending}>Add</Button>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {items.map((item) => (
          <form
            key={item.id}
            className="panel-clay grid gap-3 rounded-2xl p-4 md:grid-cols-6"
            action={(formData) => {
              startTransition(async () => {
                const res = await saveNavigationItem(formData);
                if (res.error) toast.error(res.error);
                else toast.success("Saved");
              });
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <Input name="label" label="Label" defaultValue={item.label} />
            <Input name="url" label="URL" defaultValue={item.url} />
            <SelectField
              name="location"
              label="Location"
              defaultValue={item.location}
              options={[
                { value: "header", label: "Header" },
                { value: "footer", label: "Footer" },
                { value: "both", label: "Both" },
              ]}
            />
            <Input name="sort_order" label="Order" defaultValue={String(item.sort_order)} />
            <label className="mt-7 flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_enabled" defaultChecked={item.is_enabled} />
              Enabled
            </label>
            <div className="mt-6 flex gap-2">
              <Button type="submit" size="sm" loading={pending}>Save</Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm("Remove this menu item?")) {
                    startTransition(async () => {
                      await deleteNavigationItem(item.id);
                    });
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
