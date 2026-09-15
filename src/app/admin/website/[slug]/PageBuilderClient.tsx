"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { MediaPicker } from "@/src/components/admin/MediaPicker";
import {
  addPageSection,
  deletePageSection,
  duplicatePageSection,
  reorderPageSections,
  savePageSection,
  saveSitePage,
  toggleSectionVisibility,
} from "@/src/lib/actions/cms";
import { SECTION_TYPE_LABELS, SECTION_TYPES, UI_STYLE_LABELS, UI_STYLES } from "@/src/lib/cms/constants";
import type { PageSection, SitePage } from "@/src/lib/cms/types";
import type { SectionType } from "@/src/lib/cms/constants";

function settingsFromForm(form: HTMLFormElement, existing: PageSection) {
  const fd = new FormData(form);
  const itemsRaw = String(fd.get("items_text") || "");
  const items = itemsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), text: rest.join("|").trim() };
    });

  return {
    eyebrow: String(fd.get("eyebrow") || "") || undefined,
    heading_line_2: String(fd.get("heading_line_2") || "") || undefined,
    button_text: String(fd.get("button_text") || "") || undefined,
    button_url: String(fd.get("button_url") || "") || undefined,
    button_new_tab: fd.get("button_new_tab") === "on",
    button2_text: String(fd.get("button2_text") || "") || undefined,
    button2_url: String(fd.get("button2_url") || "") || undefined,
    show_stats: fd.get("show_stats") === "on",
    show_phone: fd.get("show_phone") === "on",
    show_founder: fd.get("show_founder") === "on",
    show_values: fd.get("show_values") === "on",
    show_contact: fd.get("show_contact") === "on",
    show_categories: fd.get("show_categories") === "on",
    featured_only: fd.get("featured_only") === "on",
    recent_only: fd.get("recent_only") === "on",
    dark: fd.get("dark") === "on",
    limit: Number(fd.get("limit") || existing.settings.limit || 4),
    items: items.length ? items : existing.settings.items,
  };
}

function SectionEditor({
  section,
  onClose,
}: {
  section: PageSection;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function submit(status: "draft" | "published") {
    return (formData: FormData) => {
      startTransition(async () => {
        const form = document.getElementById(`section-form-${section.id}`) as HTMLFormElement;
        const settings = settingsFromForm(form, section);
        formData.set("settings_json", JSON.stringify(settings));
        formData.set("status", status);
        const res = await savePageSection(formData);
        if (res.error) toast.error(res.error);
        else {
          toast.success(status === "draft" ? "Draft saved" : "Section published");
          onClose();
        }
      });
    };
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10">
      <AdminCard className="w-full max-w-3xl" title={`Edit ${SECTION_TYPE_LABELS[section.section_type as SectionType] ?? section.section_type}`}>
        <form id={`section-form-${section.id}`} className="grid gap-4">
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="page_id" value={section.page_id} />
          <SelectField
            name="section_type"
            label="Section type"
            defaultValue={section.section_type}
            options={SECTION_TYPES.map((type) => ({ value: type, label: SECTION_TYPE_LABELS[type] }))}
          />
          <Input name="title" label="Heading" defaultValue={section.title ?? ""} />
          <Input name="subtitle" label="Subheading" defaultValue={section.subtitle ?? ""} />
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">Body / extra copy</span>
            <textarea name="content" defaultValue={section.content ?? ""} rows={5} className="input-clay w-full rounded-xl px-3 py-2" />
          </label>
          <Input name="eyebrow" label="Eyebrow / label" defaultValue={String(section.settings.eyebrow ?? "")} />
          {section.section_type === "hero" && (
            <Input name="heading_line_2" label="Heading line 2" defaultValue={String(section.settings.heading_line_2 ?? "")} />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="button_text" label="Button text" defaultValue={String(section.settings.button_text ?? "")} />
            <Input name="button_url" label="Button URL" defaultValue={String(section.settings.button_url ?? "")} />
            <Input name="button2_text" label="Second button text" defaultValue={String(section.settings.button2_text ?? "")} />
            <Input name="button2_url" label="Second button URL" defaultValue={String(section.settings.button2_url ?? "")} />
          </div>
          <MediaPicker label="Section image" name="image" value={section.image} folder="website" />
          <Input name="video_url" label="Video / YouTube URL" defaultValue={section.video_url ?? ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="ui_style"
              label="UI style"
              defaultValue={section.ui_style ?? "default"}
              options={[
                { value: "default", label: "Default (inherit page)" },
                ...UI_STYLES.map((style) => ({ value: style, label: UI_STYLE_LABELS[style] })),
              ]}
            />
            <SelectField
              name="background_type"
              label="Background"
              defaultValue={section.background_type}
              options={[
                { value: "none", label: "None" },
                { value: "color", label: "Color" },
                { value: "image", label: "Image" },
                { value: "gradient", label: "Gradient CSS" },
                { value: "video", label: "Video" },
              ]}
            />
          </div>
          <Input name="background_value" label="Background value (hex, CSS, or image URL)" defaultValue={section.background_value ?? ""} />
          <Input name="limit" label="Item limit" defaultValue={String(section.settings.limit ?? 4)} />
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">Feature cards (title | text, one per line)</span>
            <textarea
              name="items_text"
              rows={5}
              defaultValue={(section.settings.items ?? []).map((item) => `${item.title} | ${item.text}`).join("\n")}
              className="input-clay w-full rounded-xl px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["visible", "Visible on website", section.visible],
              ["show_stats", "Show statistics", section.settings.show_stats !== false],
              ["show_phone", "Show phone", section.settings.show_phone !== false],
              ["show_founder", "Show founder", section.settings.show_founder !== false],
              ["show_values", "Show values", Boolean(section.settings.show_values)],
              ["show_contact", "Show contact details", Boolean(section.settings.show_contact)],
              ["show_categories", "Show categories", Boolean(section.settings.show_categories)],
              ["featured_only", "Featured items only", Boolean(section.settings.featured_only)],
              ["recent_only", "Recent items only", Boolean(section.settings.recent_only)],
              ["dark", "Dark background", Boolean(section.settings.dark)],
              ["button_new_tab", "Open button in new tab", Boolean(section.settings.button_new_tab)],
            ].map(([name, label, checked]) => (
              <label key={String(name)} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />
                {String(label)}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={pending} formAction={submit("draft")}>
              Save draft
            </Button>
            <Button type="submit" loading={pending} formAction={submit("published")}>
              Publish
            </Button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

export function PageBuilderClient({ page, sections }: { page: SitePage; sections: PageSection[] }) {
  const [editing, setEditing] = useState<PageSection | null>(null);
  const [pending, startTransition] = useTransition();
  const ordered = useMemo(() => [...sections].sort((a, b) => a.sort_order - b.sort_order), [sections]);
  const publicPath = page.slug === "home" ? "/" : `/${page.slug}`;

  function move(id: string, direction: -1 | 1) {
    const ids = ordered.map((section) => section.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    startTransition(async () => {
      const res = await reorderPageSections(page.id, copy);
      if (res.error) toast.error(res.error);
    });
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${page.title}`}
        description="Change headings, images, visibility and UI style without editing code."
        actions={
          <>
            <Link href={`${publicPath}?preview=1`} target="_blank" className="btn-clay rounded-xl px-4 py-2 text-sm">
              Preview website
            </Link>
            <Link href={publicPath} target="_blank" className="rounded-xl px-4 py-2 text-sm text-navy underline">
              View live
            </Link>
          </>
        }
      />

      <AdminCard title="Page information" className="mb-6">
        <form
          action={(formData) => {
            startTransition(async () => {
              const res = await saveSitePage(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Page saved");
            });
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={page.id} />
          <input type="hidden" name="slug" value={page.slug} />
          <Input name="title" label="Title" defaultValue={page.title} />
          <SelectField
            name="ui_style"
            label="Page UI style"
            defaultValue={page.ui_style ?? "default"}
            options={[
              { value: "default", label: "Default (inherit global)" },
              ...UI_STYLES.map((style) => ({ value: style, label: UI_STYLE_LABELS[style] })),
            ]}
          />
          <Input name="seo_title" label="SEO title" defaultValue={page.seo_title ?? ""} />
          <Input name="og_image" label="OG image URL" defaultValue={page.og_image ?? ""} />
          <label className="md:col-span-2 text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">SEO description</span>
            <textarea name="seo_description" defaultValue={page.seo_description ?? ""} rows={3} className="input-clay w-full rounded-xl px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={page.published} />
            Published
          </label>
          <div className="md:col-span-2">
            <Button type="submit" loading={pending}>Save page</Button>
          </div>
        </form>
      </AdminCard>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">Sections</h3>
        <div className="flex gap-2">
          <select id="new-section-type" className="input-clay rounded-xl px-3 py-2 text-sm">
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {SECTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={() => {
              const select = document.getElementById("new-section-type") as HTMLSelectElement;
              startTransition(async () => {
                const res = await addPageSection(page.id, select.value);
                if (res.error) toast.error(res.error);
                else toast.success("Section added as draft");
              });
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add section
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {ordered.map((section, index) => (
          <div key={section.id} className="panel-clay flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <span className="w-8 text-sm font-semibold text-slate-500">{index + 1}</span>
            <div className="min-w-[180px] flex-1">
              <p className="font-semibold text-navy">
                {SECTION_TYPE_LABELS[section.section_type as SectionType] ?? section.section_type}
              </p>
              <p className="text-sm text-slate-600">{section.title || "Untitled"}</p>
              <p className="text-xs text-slate-400">
                {section.ui_style ? UI_STYLE_LABELS[section.ui_style] : "Default style"} · {section.status}
                {section.visible ? "" : " · hidden"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <button type="button" className="rounded-lg p-2 hover:bg-white/50" onClick={() => move(section.id, -1)} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-lg p-2 hover:bg-white/50" onClick={() => move(section.id, 1)} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-lg p-2 hover:bg-white/50" onClick={() => setEditing(section)}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-white/50"
                onClick={() =>
                  startTransition(async () => {
                    const res = await duplicatePageSection(section.id);
                    if (res.error) toast.error(res.error);
                  })
                }
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-white/50"
                onClick={() =>
                  startTransition(async () => {
                    const res = await toggleSectionVisibility(section.id, !section.visible);
                    if (res.error) toast.error(res.error);
                  })
                }
              >
                {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Delete this section?")) {
                    startTransition(async () => {
                      const res = await deletePageSection(section.id);
                      if (res.error) toast.error(res.error);
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && <SectionEditor section={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
