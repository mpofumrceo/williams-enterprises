import { SUPPORTED_FONTS, UI_STYLES, type UiStyle } from "./constants";
import type { SiteTheme } from "./types";

export type { SiteTheme } from "./types";

export const DEFAULT_THEME: SiteTheme = {
  id: "fallback-theme",
  name: "Construction Premium",
  is_active: true,
  primary_color: "#0a2540",
  secondary_color: "#071b2d",
  accent_color: "#d97706",
  background_color: "#f6f3ee",
  surface_color: "#ffffff",
  text_color: "#111827",
  muted_text_color: "#64748b",
  border_color: "#d7dee8",
  button_color: "#d97706",
  button_text_color: "#0a2540",
  success_color: "#16a34a",
  warning_color: "#d97706",
  error_color: "#dc2626",
  heading_font: "Inter",
  body_font: "Inter",
  accent_font: "Inter",
  heading_weight: 700,
  body_weight: 400,
  base_font_size: 16,
  heading_scale: 1.25,
  line_height: 1.6,
  letter_spacing: 0,
  default_ui_style: "skeuomorphism",
  admin_ui_style: "claymorphism",
  animation_level: "medium",
  enable_page_transitions: true,
  enable_scroll_reveals: true,
  enable_hover_effects: true,
  enable_parallax: false,
  enable_floating: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function isUiStyle(value: unknown): value is UiStyle {
  return typeof value === "string" && (UI_STYLES as readonly string[]).includes(value);
}

export function sanitizeFont(name: string | null | undefined) {
  if (name && (SUPPORTED_FONTS as readonly string[]).includes(name)) return name;
  return "Inter";
}

export function resolveUiStyle(
  sectionStyle: string | null | undefined,
  pageStyle: string | null | undefined,
  globalStyle: string | null | undefined
): UiStyle {
  if (isUiStyle(sectionStyle)) return sectionStyle;
  if (isUiStyle(pageStyle)) return pageStyle;
  if (isUiStyle(globalStyle)) return globalStyle;
  return "skeuomorphism";
}

export function uiStyleClass(style: UiStyle) {
  return `ui-${style}`;
}

export function googleFontsHref(theme: Pick<SiteTheme, "heading_font" | "body_font" | "accent_font">) {
  const families = Array.from(
    new Set(
      [theme.heading_font, theme.body_font, theme.accent_font].map((font) => sanitizeFont(font))
    )
  );
  const query = families
    .map((font) => `family=${encodeURIComponent(font)}:wght@400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function themeCssVars(theme: SiteTheme): Record<string, string> {
  return {
    "--color-primary": theme.primary_color,
    "--color-secondary": theme.secondary_color,
    "--color-accent": theme.accent_color,
    "--color-background": theme.background_color,
    "--color-surface": theme.surface_color,
    "--color-text": theme.text_color,
    "--color-muted": theme.muted_text_color,
    "--color-border": theme.border_color,
    "--color-button": theme.button_color,
    "--color-button-text": theme.button_text_color,
    "--color-success": theme.success_color,
    "--color-warning": theme.warning_color,
    "--color-error": theme.error_color,
    "--font-heading": `'${sanitizeFont(theme.heading_font)}', system-ui, sans-serif`,
    "--font-body": `'${sanitizeFont(theme.body_font)}', system-ui, sans-serif`,
    "--font-accent": `'${sanitizeFont(theme.accent_font)}', system-ui, sans-serif`,
    "--heading-weight": String(theme.heading_weight || 700),
    "--body-weight": String(theme.body_weight || 400),
    "--font-size-base": `${theme.base_font_size || 16}px`,
    "--heading-scale": String(theme.heading_scale || 1.25),
    "--line-height": String(theme.line_height || 1.6),
    "--letter-spacing": `${theme.letter_spacing || 0}em`,
  };
}

export function themeStyleAttribute(theme: SiteTheme) {
  return Object.entries(themeCssVars(theme))
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

export function hexColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const trimmed = value.trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) ? trimmed : fallback;
}
