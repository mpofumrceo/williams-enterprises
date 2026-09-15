"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { ColorPicker } from "@/src/components/admin/ColorPicker";
import { saveSiteTheme } from "@/src/lib/actions/cms";
import { ANIMATION_LEVELS, SUPPORTED_FONTS, THEME_PRESETS, UI_STYLE_LABELS, UI_STYLES } from "@/src/lib/cms/constants";
import { themeCssVars, type SiteTheme } from "@/src/lib/cms/theme";

export function ThemeEditorClient({ theme }: { theme: SiteTheme }) {
  const [draft, setDraft] = useState(theme);
  const [pending, startTransition] = useTransition();
  const previewVars = useMemo(() => themeCssVars(draft), [draft]);

  function applyPreset(id: string) {
    const preset = THEME_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setDraft((current) => ({
      ...current,
      name: preset.name,
      default_ui_style: preset.default_ui_style,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      background_color: preset.background_color,
      surface_color: preset.surface_color,
      text_color: preset.text_color,
      muted_text_color: preset.muted_text_color,
      border_color: preset.border_color,
      button_color: preset.button_color,
      button_text_color: preset.button_text_color,
      heading_font: preset.heading_font,
      body_font: preset.body_font,
    }));
  }

  return (
    <div>
      <PageHeader
        title="Theme & brand editor"
        description="Change colors, fonts, animation and the default UI style. Preview updates immediately; save to publish."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            className="btn-clay rounded-xl px-3 py-2 text-sm"
          >
            {preset.name}
          </button>
        ))}
        <Button type="button" variant="ghost" onClick={() => setDraft(theme)}>
          Reset
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          action={(formData) => {
            startTransition(async () => {
              const res = await saveSiteTheme(formData);
              if (res.error) toast.error(res.error);
              else toast.success("Theme published");
            });
          }}
          className="space-y-6"
        >
          <input type="hidden" name="id" value={draft.id.startsWith("fallback") ? "" : draft.id} />
          <AdminCard title="Colors">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPicker name="primary_color" label="Primary" value={draft.primary_color} onChange={(v) => setDraft({ ...draft, primary_color: v })} />
              <ColorPicker name="secondary_color" label="Secondary" value={draft.secondary_color} onChange={(v) => setDraft({ ...draft, secondary_color: v })} />
              <ColorPicker name="accent_color" label="Accent" value={draft.accent_color} onChange={(v) => setDraft({ ...draft, accent_color: v })} />
              <ColorPicker name="background_color" label="Background" value={draft.background_color} onChange={(v) => setDraft({ ...draft, background_color: v })} />
              <ColorPicker name="surface_color" label="Surface" value={draft.surface_color} onChange={(v) => setDraft({ ...draft, surface_color: v })} />
              <ColorPicker name="text_color" label="Text" value={draft.text_color} onChange={(v) => setDraft({ ...draft, text_color: v })} />
              <ColorPicker name="muted_text_color" label="Muted text" value={draft.muted_text_color} onChange={(v) => setDraft({ ...draft, muted_text_color: v })} />
              <ColorPicker name="border_color" label="Border" value={draft.border_color} onChange={(v) => setDraft({ ...draft, border_color: v })} />
              <ColorPicker name="button_color" label="Button" value={draft.button_color} onChange={(v) => setDraft({ ...draft, button_color: v })} />
              <ColorPicker name="button_text_color" label="Button text" value={draft.button_text_color} onChange={(v) => setDraft({ ...draft, button_text_color: v })} />
              <ColorPicker name="success_color" label="Success" value={draft.success_color} onChange={(v) => setDraft({ ...draft, success_color: v })} />
              <ColorPicker name="warning_color" label="Warning" value={draft.warning_color} onChange={(v) => setDraft({ ...draft, warning_color: v })} />
              <ColorPicker name="error_color" label="Error" value={draft.error_color} onChange={(v) => setDraft({ ...draft, error_color: v })} />
            </div>
          </AdminCard>

          <AdminCard title="Typography">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["heading_font", "Heading font", draft.heading_font, (v: string) => setDraft({ ...draft, heading_font: v })],
                ["body_font", "Body font", draft.body_font, (v: string) => setDraft({ ...draft, body_font: v })],
                ["accent_font", "Accent font", draft.accent_font, (v: string) => setDraft({ ...draft, accent_font: v })],
              ].map(([name, label, value, onChange]) => (
                <label key={String(name)} className="text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">{label as string}</span>
                  <select
                    name={name as string}
                    value={value as string}
                    onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                    className="input-clay w-full rounded-xl px-4 py-2.5 text-sm"
                  >
                    {SUPPORTED_FONTS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <Input name="heading_weight" label="Heading weight" defaultValue={String(draft.heading_weight)} />
              <Input name="body_weight" label="Body weight" defaultValue={String(draft.body_weight)} />
              <Input name="base_font_size" label="Base font size" defaultValue={String(draft.base_font_size)} />
              <Input name="heading_scale" label="Heading scale" defaultValue={String(draft.heading_scale)} />
              <Input name="line_height" label="Line height" defaultValue={String(draft.line_height)} />
              <Input name="letter_spacing" label="Letter spacing" defaultValue={String(draft.letter_spacing)} />
            </div>
          </AdminCard>

          <AdminCard title="UI styles & motion">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Global default style</span>
                <select
                  name="default_ui_style"
                  value={draft.default_ui_style}
                  onChange={(e) => setDraft({ ...draft, default_ui_style: e.target.value as typeof draft.default_ui_style })}
                  className="input-clay w-full rounded-xl px-4 py-2.5 text-sm"
                >
                  {UI_STYLES.map((style) => (
                    <option key={style} value={style}>{UI_STYLE_LABELS[style]}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Admin style</span>
                <select
                  name="admin_ui_style"
                  value={draft.admin_ui_style}
                  onChange={(e) => setDraft({ ...draft, admin_ui_style: e.target.value as typeof draft.admin_ui_style })}
                  className="input-clay w-full rounded-xl px-4 py-2.5 text-sm"
                >
                  {UI_STYLES.map((style) => (
                    <option key={style} value={style}>{UI_STYLE_LABELS[style]}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Animation level</span>
                <select
                  name="animation_level"
                  value={draft.animation_level}
                  onChange={(e) => setDraft({ ...draft, animation_level: e.target.value as typeof draft.animation_level })}
                  className="input-clay w-full rounded-xl px-4 py-2.5 text-sm"
                >
                  {ANIMATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>
              <Input name="name" label="Theme name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["enable_page_transitions", "Page transitions", draft.enable_page_transitions],
                ["enable_scroll_reveals", "Scroll reveals", draft.enable_scroll_reveals],
                ["enable_hover_effects", "Hover effects", draft.enable_hover_effects],
                ["enable_parallax", "Parallax", draft.enable_parallax],
                ["enable_floating", "Floating effects", draft.enable_floating],
              ].map(([name, label, checked]) => (
                <label key={String(name)} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />
                  {String(label)}
                </label>
              ))}
            </div>
          </AdminCard>

          <Button type="submit" loading={pending}>Save changes</Button>
        </form>

        <div className="panel-clay sticky top-24 rounded-3xl p-5" style={previewVars as React.CSSProperties}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-accent)" }}>
            Live preview
          </p>
          <h3 className="mt-2 text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
            {draft.name}
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            Sample body text using the selected typeface and colors.
          </p>
          <div className="mt-5 grid gap-3">
            {UI_STYLES.map((style) => (
              <div key={style} data-ui-style={style} className="cms-surface p-4">
                <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  {UI_STYLE_LABELS[style]}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
                  Section surface preview
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 rounded-full px-5 py-2 text-sm font-semibold"
            style={{ background: "var(--color-button)", color: "var(--color-button-text)" }}
          >
            Sample button
          </button>
        </div>
      </div>
    </div>
  );
}
