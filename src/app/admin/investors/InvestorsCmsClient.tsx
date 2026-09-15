"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { MediaPicker } from "@/src/components/admin/MediaPicker";
import {
  deleteInvestorOpportunity,
  deleteInvestorStatistic,
  saveInvestorOpportunity,
  saveInvestorStatistic,
} from "@/src/lib/actions/cms";
import type { InvestorOpportunity, InvestorStatistic } from "@/src/lib/cms/types";

export function InvestorsCmsClient({
  opportunities,
  statistics,
}: {
  opportunities: InvestorOpportunity[];
  statistics: InvestorStatistic[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <PageHeader
        title="Investors"
        description="Edit opportunities and statistics shown on the Investors page. Only enter actual values."
      />

      <AdminCard title="Add statistic" className="mb-6">
        <form
          className="grid gap-3 md:grid-cols-4"
          action={(formData) => {
            formData.set("published", "on");
            startTransition(async () => {
              const res = await saveInvestorStatistic(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Statistic added");
            });
          }}
        >
          <Input name="label" label="Label" required />
          <Input name="value" label="Value" required />
          <Input name="sort_order" label="Order" defaultValue={String(statistics.length + 1)} />
          <div className="flex items-end">
            <Button type="submit" loading={pending}>Add</Button>
          </div>
        </form>
        <div className="mt-4 space-y-3">
          {statistics.map((stat) => (
            <form
              key={stat.id}
              className="grid gap-3 rounded-xl bg-white/40 p-3 md:grid-cols-5"
              action={(formData) => {
                startTransition(async () => {
                  const res = await saveInvestorStatistic(formData);
                  if (res.error) toast.error(res.error);
                  else toast.success("Saved");
                });
              }}
            >
              <input type="hidden" name="id" value={stat.id} />
              <Input name="label" label="Label" defaultValue={stat.label} />
              <Input name="value" label="Value" defaultValue={stat.value} />
              <Input name="sort_order" label="Order" defaultValue={String(stat.sort_order)} />
              <label className="mt-7 flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked={stat.published} />
                Published
              </label>
              <div className="mt-6 flex gap-2">
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" size="sm" variant="danger" onClick={() => startTransition(async () => { await deleteInvestorStatistic(stat.id); })}>
                  Delete
                </Button>
              </div>
            </form>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Add opportunity">
        <form
          className="grid gap-3 md:grid-cols-2"
          action={(formData) => {
            formData.set("published", "on");
            startTransition(async () => {
              const res = await saveInvestorOpportunity(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Opportunity added");
            });
          }}
        >
          <Input name="title" label="Title" required />
          <Input name="location" label="Location" />
          <Input name="category" label="Category" />
          <Input name="status" label="Status" defaultValue="open" />
          <Input name="timeline" label="Timeline" />
          <Input name="investment_requirement" label="Investment requirement (only if real)" />
          <label className="md:col-span-2 text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">Description</span>
            <textarea name="description" rows={3} className="input-clay w-full rounded-xl px-3 py-2" />
          </label>
          <MediaPicker label="Image" name="image_url" folder="investors" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" />
            Featured
          </label>
          <div>
            <Button type="submit" loading={pending}>Add opportunity</Button>
          </div>
        </form>
      </AdminCard>

      <div className="mt-6 space-y-4">
        {opportunities.map((item) => (
          <form
            key={item.id}
            className="panel-clay grid gap-3 rounded-3xl p-5 md:grid-cols-2"
            action={(formData) => {
              startTransition(async () => {
                const res = await saveInvestorOpportunity(formData);
                if (res.error) toast.error(res.error);
                else toast.success("Saved");
              });
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <Input name="title" label="Title" defaultValue={item.title} />
            <Input name="location" label="Location" defaultValue={item.location ?? ""} />
            <Input name="category" label="Category" defaultValue={item.category ?? ""} />
            <Input name="status" label="Status" defaultValue={item.status ?? "open"} />
            <Input name="timeline" label="Timeline" defaultValue={item.timeline ?? ""} />
            <Input name="investment_requirement" label="Investment requirement" defaultValue={item.investment_requirement ?? ""} />
            <label className="md:col-span-2 text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Description</span>
              <textarea name="description" defaultValue={item.description ?? ""} rows={3} className="input-clay w-full rounded-xl px-3 py-2" />
            </label>
            <MediaPicker label="Image" name="image_url" value={item.image_url} folder="investors" />
            <Input name="sort_order" label="Order" defaultValue={String(item.sort_order)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={item.featured} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={item.published} />
              Published
            </label>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" size="sm" variant="danger" onClick={() => startTransition(async () => { await deleteInvestorOpportunity(item.id); })}>
                Delete
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
