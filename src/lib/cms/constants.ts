export const UI_STYLES = [
  "minimalism",
  "neumorphism",
  "glassmorphism",
  "skeuomorphism",
  "claymorphism",
] as const;

export type UiStyle = (typeof UI_STYLES)[number];

export const UI_STYLE_LABELS: Record<UiStyle, string> = {
  minimalism: "Minimalism",
  neumorphism: "Neumorphism",
  glassmorphism: "Glassmorphism",
  skeuomorphism: "Skeuomorphism",
  claymorphism: "Claymorphism",
};

export const ANIMATION_LEVELS = ["none", "subtle", "medium", "dynamic"] as const;
export type AnimationLevel = (typeof ANIMATION_LEVELS)[number];

export const SUPPORTED_FONTS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Outfit",
  "DM Sans",
  "Source Sans 3",
  "Playfair Display",
  "Merriweather",
] as const;

export type SupportedFont = (typeof SUPPORTED_FONTS)[number];

export const FONT_WEIGHTS = [400, 500, 600, 700, 800] as const;

export const SECTION_TYPES = [
  "hero",
  "intro",
  "text",
  "showcase",
  "stats",
  "services",
  "projects",
  "features",
  "investment",
  "gallery",
  "news",
  "reviews",
  "faq",
  "cta",
  "leadership",
  "mission_vision",
  "opportunities",
  "pipeline",
  "strategy",
  "contact_info",
  "contact_form",
  "map",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  intro: "Introduction",
  text: "Text",
  showcase: "Video / Showcase",
  stats: "Statistics",
  services: "Services",
  projects: "Projects",
  features: "Feature cards",
  investment: "Investment preview",
  gallery: "Gallery",
  news: "News",
  reviews: "Reviews",
  faq: "FAQ",
  cta: "Call to action",
  leadership: "Leadership",
  mission_vision: "Mission & Vision",
  opportunities: "Opportunities",
  pipeline: "Pipeline",
  strategy: "Strategy",
  contact_info: "Contact information",
  contact_form: "Contact form",
  map: "Map",
};

export const PAGE_SLUGS = [
  "home",
  "about",
  "services",
  "projects",
  "gallery",
  "news",
  "investors",
  "contact",
] as const;

export type PageSlug = (typeof PAGE_SLUGS)[number];

export const THEME_PRESETS = [
  {
    id: "construction-premium",
    name: "Construction Premium",
    description: "Skeuomorphism with architectural depth and professional navy/amber.",
    default_ui_style: "skeuomorphism" as UiStyle,
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
    heading_font: "Inter",
    body_font: "Inter",
  },
  {
    id: "glass-architecture",
    name: "Glass Architecture",
    description: "Glassmorphism with spatial layouts and premium transparent surfaces.",
    default_ui_style: "glassmorphism" as UiStyle,
    primary_color: "#0b1f33",
    secondary_color: "#132f4a",
    accent_color: "#f59e0b",
    background_color: "#eef3f8",
    surface_color: "#ffffff",
    text_color: "#0f172a",
    muted_text_color: "#64748b",
    border_color: "#cbd5e1",
    button_color: "#f59e0b",
    button_text_color: "#0b1f33",
    heading_font: "Outfit",
    body_font: "DM Sans",
  },
  {
    id: "modern-corporate",
    name: "Modern Corporate",
    description: "Minimalism with clean typography and strong hierarchy.",
    default_ui_style: "minimalism" as UiStyle,
    primary_color: "#111827",
    secondary_color: "#1f2937",
    accent_color: "#b45309",
    background_color: "#fafafa",
    surface_color: "#ffffff",
    text_color: "#111827",
    muted_text_color: "#6b7280",
    border_color: "#e5e7eb",
    button_color: "#111827",
    button_text_color: "#ffffff",
    heading_font: "Montserrat",
    body_font: "Inter",
  },
  {
    id: "soft-clay",
    name: "Soft Clay",
    description: "Claymorphism with soft 3D surfaces and warm materials.",
    default_ui_style: "claymorphism" as UiStyle,
    primary_color: "#3f2e1f",
    secondary_color: "#2b1e14",
    accent_color: "#c2410c",
    background_color: "#efe6d6",
    surface_color: "#fffdf8",
    text_color: "#1c140d",
    muted_text_color: "#7c6a58",
    border_color: "#e7d8bf",
    button_color: "#c2410c",
    button_text_color: "#fffdf8",
    heading_font: "Poppins",
    body_font: "Source Sans 3",
  },
] as const;

export const DEFAULT_NAV = [
  { label: "Home", url: "/", sort_order: 1 },
  { label: "About", url: "/about", sort_order: 2 },
  { label: "Services", url: "/services", sort_order: 3 },
  { label: "Projects", url: "/projects", sort_order: 4 },
  { label: "Gallery", url: "/gallery", sort_order: 5 },
  { label: "News", url: "/news", sort_order: 6 },
  { label: "Investors", url: "/investors", sort_order: 7 },
  { label: "Contact", url: "/contact", sort_order: 8 },
] as const;

export const BLOCKED_NAV_PREFIXES = ["/admin", "/portal", "/api"];
