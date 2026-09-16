"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { AboutContent } from "@/src/types/database";
import { updateAboutContent } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";

type StatRow = { label: string; value: string };

function AboutForm({ content }: { content: AboutContent }) {
  const [pending, startTransition] = useTransition();
  const [stats, setStats] = useState<StatRow[]>(
    content.stats?.length
      ? content.stats.map((s) => ({ label: s.label, value: s.value }))
      : []
  );

  function updateStat(index: number, field: keyof StatRow, value: string) {
    setStats((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addStat() {
    setStats((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cleaned = stats
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value);
    formData.set("stats", JSON.stringify(cleaned));

    startTransition(async () => {
      const res = await updateAboutContent(content?.id, formData);
      if (res.error) toast.error(res.error);
      else toast.success("About content & stats updated");
    });
  }

  const valuesStr = Array.isArray(content.values)
    ? content.values.join("\n")
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Input name="title" label="Title" defaultValue={content.title ?? ""} />
        <Textarea
          name="main_description"
          label="Main Description"
          rows={3}
          defaultValue={content.main_description ?? ""}
        />
        <Textarea
          name="company_story"
          label="Company Story"
          rows={4}
          defaultValue={content.company_story ?? ""}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Textarea name="mission" label="Mission" rows={3} defaultValue={content.mission ?? ""} />
          <Textarea name="vision" label="Vision" rows={3} defaultValue={content.vision ?? ""} />
        </div>
        <Textarea
          name="values"
          label="Values (one per line)"
          rows={5}
          defaultValue={valuesStr}
          placeholder={"Integrity & Transparency\nSafety First\nQuality Workmanship"}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-navy">Homepage & About Stats</h3>
            <p className="text-sm text-slate-500">
              These numbers appear on the homepage and about page. Add, edit, or remove rows.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addStat}>
            <Plus size={16} className="mr-1" /> Add stat
          </Button>
        </div>

        {stats.length === 0 ? (
          <p className="text-sm text-slate-500">No stats yet. Click “Add stat”.</p>
        ) : (
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-3">
                <div className="min-w-[120px] flex-1">
                  <Input
                    label="Value"
                    value={stat.value}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    placeholder="Published figure"
                  />
                </div>
                <div className="min-w-[160px] flex-[2]">
                  <Input
                    label="Label"
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    placeholder="Projects Completed"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mb-0.5 text-red-600 hover:bg-red-50"
                  onClick={() => removeStat(index)}
                  aria-label="Remove stat"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="cta_title" label="CTA Title" defaultValue={content.cta_title ?? ""} />
          <Input
            name="cta_button_text"
            label="CTA Button Text"
            defaultValue={content.cta_button_text ?? ""}
          />
          <Input
            name="cta_button_url"
            label="CTA Button URL"
            defaultValue={content.cta_button_url ?? ""}
          />
        </div>
        <Textarea
          name="cta_description"
          label="CTA Description"
          rows={2}
          defaultValue={content.cta_description ?? ""}
        />
      </div>

      <Button type="submit" loading={pending}>
        Save About Content
      </Button>
    </form>
  );
}

export default function AboutClient({ content }: { content: AboutContent | null }) {
  const defaultContent: AboutContent = content ?? {
    id: "",
    title: "About Williams Enterprises",
    main_description: "Leading construction, civil engineering, and equipment hire firm.",
    company_story: "Williams Enterprises was established to deliver world-class infrastructure.",
    mission: "To deliver high-quality construction services safely and on time.",
    vision: "To be the premier construction partner across Southern Africa.",
    values: ["Quality Workmanship", "Safety First", "Integrity & Transparency"],
    stats: [],
    cta_title: "Ready to Build?",
    cta_description: "Contact our expert team to discuss your project requirements.",
    cta_button_text: "Get a Quote",
    cta_button_url: "/contact",
    updated_at: new Date().toISOString(),
  };

  return (
    <div>
      <PageHeader
        title="About & Stats"
        description="Edit about page copy and the stats shown on the homepage and about page."
      />
      <AdminCard>
        <AboutForm content={defaultContent} />
      </AdminCard>
    </div>
  );
}
