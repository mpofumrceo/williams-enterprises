import type { AnimationLevel, PageSlug, SectionType, UiStyle } from "./constants";

export interface SiteBranding {
  id: string;
  company_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  tagline: string | null;
  default_og_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteTheme {
  id: string;
  name: string;
  is_active: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  border_color: string;
  button_color: string;
  button_text_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  heading_font: string;
  body_font: string;
  accent_font: string;
  heading_weight: number;
  body_weight: number;
  base_font_size: number;
  heading_scale: number;
  line_height: number;
  letter_spacing: number;
  default_ui_style: UiStyle;
  admin_ui_style: UiStyle;
  animation_level: AnimationLevel;
  enable_page_transitions: boolean;
  enable_scroll_reveals: boolean;
  enable_hover_effects: boolean;
  enable_parallax: boolean;
  enable_floating: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitePage {
  id: string;
  slug: PageSlug | string;
  title: string;
  description: string | null;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  ui_style: UiStyle | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FeatureItem {
  title: string;
  text: string;
}

export interface SectionSettings {
  eyebrow?: string;
  heading_line_2?: string;
  button_text?: string;
  button_url?: string;
  button_new_tab?: boolean;
  button2_text?: string;
  button2_url?: string;
  button2_new_tab?: boolean;
  show_stats?: boolean;
  show_phone?: boolean;
  show_founder?: boolean;
  show_values?: boolean;
  show_contact?: boolean;
  show_filters?: boolean;
  show_categories?: boolean;
  featured_only?: boolean;
  recent_only?: boolean;
  dark?: boolean;
  limit?: number;
  alignment?: "left" | "center" | "right";
  animation?: AnimationLevel | "inherit";
  items?: FeatureItem[];
  source?: "about" | "investor";
  [key: string]: unknown;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: SectionType | string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image: string | null;
  video_url: string | null;
  settings: SectionSettings;
  ui_style: UiStyle | null;
  background_type: "none" | "color" | "image" | "video" | "gradient";
  background_value: string | null;
  visible: boolean;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  location: "header" | "footer" | "both";
  open_in_new_tab: boolean;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FooterSettings {
  id: string;
  logo_url: string | null;
  description: string | null;
  copyright: string | null;
  cta_text: string | null;
  cta_url: string | null;
  column_title: string | null;
  show_newsletter: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaLibraryItem {
  id: string;
  title: string | null;
  alt_text: string | null;
  url: string;
  storage_path: string | null;
  bucket: string;
  folder: string | null;
  mime_type: string | null;
  media_kind: "image" | "video" | "document";
  category: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestorOpportunity {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  timeline: string | null;
  image_url: string | null;
  investment_requirement: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvestorStatistic {
  id: string;
  label: string;
  value: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsPagePayload {
  page: SitePage;
  sections: PageSection[];
}
