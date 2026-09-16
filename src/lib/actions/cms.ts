"use server";

import { revalidatePath as nextRevalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { getProfile, logActivity } from "@/src/lib/auth/session";
import { isStaffRole } from "@/src/lib/permissions/roles";
import { BLOCKED_NAV_PREFIXES, SECTION_TYPES, UI_STYLES } from "@/src/lib/cms/constants";
import { DEFAULT_THEME, hexColor, isUiStyle, sanitizeFont } from "@/src/lib/cms/theme";
import { uploadFile } from "@/src/lib/actions/admin";
import type { PageSection, SectionSettings } from "@/src/lib/cms/types";
import type { UiStyle } from "@/src/lib/cms/constants";
import { hasPermission, type Permission } from "@/src/lib/security/permissions";
import { sanitizeHref } from "@/src/lib/security/urls";

function revalidateCms(paths: string[] = []) {
  nextRevalidatePath("/", "layout");
  nextRevalidatePath("/admin", "layout");
  for (const path of [
    "/",
    "/about",
    "/services",
    "/projects",
    "/gallery",
    "/news",
    "/investors",
    "/contact",
    ...paths,
  ]) {
    nextRevalidatePath(path);
  }
  revalidateTag("public", "max");
  revalidateTag("cms", "max");
}

async function requireStaffClient(permission: Permission = "content") {
  const profile = await getProfile();
  if (!profile || !isStaffRole(profile.role) || !profile.is_active || !hasPermission(profile, permission)) {
    return { error: "Unauthorized" as const, supabase: null, profile: null };
  }
  return { error: null, supabase: await createClient(), profile };
}

function optionalUiStyle(value: FormDataEntryValue | null): UiStyle | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "default") return null;
  return isUiStyle(raw) ? raw : null;
}

function parseJsonSettings(raw: string | null): SectionSettings {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as SectionSettings;
    }
  } catch {
    return {};
  }
  return {};
}

function blockedNavUrl(url: string) {
  const normalized = url.trim().toLowerCase();
  return BLOCKED_NAV_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

export async function saveSiteTheme(formData: FormData) {
  const auth = await requireStaffClient("design");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const payload = {
    name: String(formData.get("name") ?? "Williams Enterprises"),
    primary_color: hexColor(String(formData.get("primary_color")), DEFAULT_THEME.primary_color),
    secondary_color: hexColor(String(formData.get("secondary_color")), DEFAULT_THEME.secondary_color),
    accent_color: hexColor(String(formData.get("accent_color")), DEFAULT_THEME.accent_color),
    background_color: hexColor(String(formData.get("background_color")), DEFAULT_THEME.background_color),
    surface_color: hexColor(String(formData.get("surface_color")), DEFAULT_THEME.surface_color),
    text_color: hexColor(String(formData.get("text_color")), DEFAULT_THEME.text_color),
    muted_text_color: hexColor(String(formData.get("muted_text_color")), DEFAULT_THEME.muted_text_color),
    border_color: hexColor(String(formData.get("border_color")), DEFAULT_THEME.border_color),
    button_color: hexColor(String(formData.get("button_color")), DEFAULT_THEME.button_color),
    button_text_color: hexColor(String(formData.get("button_text_color")), DEFAULT_THEME.button_text_color),
    success_color: hexColor(String(formData.get("success_color")), DEFAULT_THEME.success_color),
    warning_color: hexColor(String(formData.get("warning_color")), DEFAULT_THEME.warning_color),
    error_color: hexColor(String(formData.get("error_color")), DEFAULT_THEME.error_color),
    heading_font: sanitizeFont(String(formData.get("heading_font"))),
    body_font: sanitizeFont(String(formData.get("body_font"))),
    accent_font: sanitizeFont(String(formData.get("accent_font"))),
    heading_weight: Number(formData.get("heading_weight") || 700),
    body_weight: Number(formData.get("body_weight") || 400),
    base_font_size: Number(formData.get("base_font_size") || 16),
    heading_scale: Number(formData.get("heading_scale") || 1.25),
    line_height: Number(formData.get("line_height") || 1.6),
    letter_spacing: Number(formData.get("letter_spacing") || 0),
    default_ui_style: isUiStyle(String(formData.get("default_ui_style")))
      ? String(formData.get("default_ui_style"))
      : "skeuomorphism",
    admin_ui_style: isUiStyle(String(formData.get("admin_ui_style")))
      ? String(formData.get("admin_ui_style"))
      : "claymorphism",
    animation_level: ["none", "subtle", "medium", "dynamic"].includes(String(formData.get("animation_level")))
      ? String(formData.get("animation_level"))
      : "medium",
    enable_page_transitions: formData.get("enable_page_transitions") === "on",
    enable_scroll_reveals: formData.get("enable_scroll_reveals") === "on",
    enable_hover_effects: formData.get("enable_hover_effects") === "on",
    enable_parallax: formData.get("enable_parallax") === "on",
    enable_floating: formData.get("enable_floating") === "on",
    is_active: true,
  };

  const id = String(formData.get("id") || "");
  const query = id
    ? auth.supabase.from("site_theme").update(payload).eq("id", id)
    : auth.supabase.from("site_theme").insert(payload);

  const { error } = await query;
  if (error) return { error: error.message };
  await logActivity("update_theme", "site_theme", id || "new");
  revalidateCms(["/admin/theme"]);
  return { success: true };
}

export async function saveSiteBranding(formData: FormData) {
  const auth = await requireStaffClient("settings");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const payload = {
    company_name: String(formData.get("company_name") || "Williams Enterprises").trim(),
    logo_url: String(formData.get("logo_url") || "").trim() || null,
    favicon_url: String(formData.get("favicon_url") || "").trim() || null,
    tagline: String(formData.get("tagline") || "").trim() || null,
    default_og_image: String(formData.get("default_og_image") || "").trim() || null,
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description: String(formData.get("seo_description") || "").trim() || null,
    seo_keywords: String(formData.get("seo_keywords") || "").trim() || null,
  };

  const id = String(formData.get("id") || "");
  const { error } = id
    ? await auth.supabase.from("site_branding").update(payload).eq("id", id)
    : await auth.supabase.from("site_branding").insert(payload);

  if (error) return { error: error.message };
  await logActivity("update_branding", "site_branding", id || "new");
  revalidateCms(["/admin/settings"]);
  return { success: true };
}

export async function saveFooterSettings(formData: FormData) {
  const auth = await requireStaffClient("navigation");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const payload = {
    logo_url: String(formData.get("logo_url") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    copyright: String(formData.get("copyright") || "").trim() || null,
    cta_text: String(formData.get("cta_text") || "").trim() || null,
    cta_url: String(formData.get("cta_url") || "/contact").trim(),
    column_title: String(formData.get("column_title") || "Navigate").trim(),
    show_newsletter: formData.get("show_newsletter") === "on",
  };

  const id = String(formData.get("id") || "");
  const { error } = id
    ? await auth.supabase.from("footer_settings").update(payload).eq("id", id)
    : await auth.supabase.from("footer_settings").insert(payload);

  if (error) return { error: error.message };
  await logActivity("update_footer", "footer_settings", id || "new");
  revalidateCms(["/admin/footer"]);
  return { success: true };
}

export async function saveSitePage(formData: FormData) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing page" };

  const { error } = await auth.supabase
    .from("site_pages")
    .update({
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      published: formData.get("published") === "on",
      seo_title: String(formData.get("seo_title") || "").trim() || null,
      seo_description: String(formData.get("seo_description") || "").trim() || null,
      og_image: String(formData.get("og_image") || "").trim() || null,
      ui_style: optionalUiStyle(formData.get("ui_style")),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  await logActivity("update_page", "site_pages", id);
  revalidateCms([`/admin/website/${String(formData.get("slug") || "")}`]);
  return { success: true };
}

export async function savePageSection(formData: FormData) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const id = String(formData.get("id") || "");
  const pageId = String(formData.get("page_id") || "");
  const status = formData.get("status") === "draft" ? "draft" : "published";
  const settings = parseJsonSettings(String(formData.get("settings_json") || "{}"));

  const payload = {
    page_id: pageId,
    section_type: String(formData.get("section_type") || "text"),
    title: String(formData.get("title") || "").trim() || null,
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    content: String(formData.get("content") || "").trim() || null,
    image: String(formData.get("image") || "").trim() || null,
    video_url: String(formData.get("video_url") || "").trim() || null,
    settings,
    ui_style: optionalUiStyle(formData.get("ui_style")),
    background_type: String(formData.get("background_type") || "none"),
    background_value: String(formData.get("background_value") || "").trim() || null,
    visible: formData.get("visible") === "on",
    status,
  };

  if (id) {
    const { error } = await auth.supabase.from("page_sections").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await logActivity("update_section", "page_sections", id);
  } else {
    const { data: last } = await auth.supabase
      .from("page_sections")
      .select("sort_order")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await auth.supabase.from("page_sections").insert({
      ...payload,
      sort_order: Number(last?.sort_order ?? 0) + 1,
    });
    if (error) return { error: error.message };
    await logActivity("create_section", "page_sections", pageId);
  }

  revalidateCms();
  return { success: true };
}

export async function duplicatePageSection(id: string) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const { data, error } = await auth.supabase.from("page_sections").select("*").eq("id", id).single();
  if (error || !data) return { error: error?.message ?? "Section not found" };
  const section = data as PageSection;
  const { error: insertError } = await auth.supabase.from("page_sections").insert({
    page_id: section.page_id,
    section_type: section.section_type,
    title: section.title ? `${section.title} (copy)` : section.title,
    subtitle: section.subtitle,
    content: section.content,
    image: section.image,
    video_url: section.video_url,
    settings: section.settings ?? {},
    ui_style: section.ui_style,
    background_type: section.background_type,
    background_value: section.background_value,
    visible: false,
    status: "draft",
    sort_order: section.sort_order + 1,
  });
  if (insertError) return { error: insertError.message };
  await logActivity("duplicate_section", "page_sections", id);
  revalidateCms();
  return { success: true };
}

export async function toggleSectionVisibility(id: string, visible: boolean) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("page_sections").update({ visible }).eq("id", id);
  if (error) return { error: error.message };
  revalidateCms();
  return { success: true };
}

export async function deletePageSection(id: string) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("page_sections").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_section", "page_sections", id);
  revalidateCms();
  return { success: true };
}

export async function reorderPageSections(pageId: string, orderedIds: string[]) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  await Promise.all(
    orderedIds.map((id, index) =>
      auth.supabase!.from("page_sections").update({ sort_order: index + 1 }).eq("id", id).eq("page_id", pageId)
    )
  );
  revalidateCms();
  return { success: true };
}

export async function addPageSection(pageId: string, sectionType: string) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const type = SECTION_TYPES.includes(sectionType as (typeof SECTION_TYPES)[number])
    ? sectionType
    : "text";
  const { data: last } = await auth.supabase
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await auth.supabase.from("page_sections").insert({
    page_id: pageId,
    section_type: type,
    title: "New section",
    visible: false,
    status: "draft",
    sort_order: Number(last?.sort_order ?? 0) + 1,
    settings: {},
  });
  if (error) return { error: error.message };
  revalidateCms();
  return { success: true };
}

export async function saveNavigationItem(formData: FormData) {
  const auth = await requireStaffClient("navigation");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };

  const url = sanitizeHref(String(formData.get("url") || "").trim(), "");
  if (!url) return { error: "URL is required" };
  if (blockedNavUrl(url)) return { error: "Admin and portal routes cannot be added to public navigation." };

  const payload = {
    label: String(formData.get("label") || "").trim(),
    url,
    location: String(formData.get("location") || "header"),
    open_in_new_tab: formData.get("open_in_new_tab") === "on",
    is_enabled: formData.get("is_enabled") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const id = String(formData.get("id") || "");
  const { error } = id
    ? await auth.supabase.from("navigation_items").update(payload).eq("id", id)
    : await auth.supabase.from("navigation_items").insert(payload);

  if (error) return { error: error.message };
  revalidateCms(["/admin/navigation"]);
  return { success: true };
}

export async function deleteNavigationItem(id: string) {
  const auth = await requireStaffClient("navigation");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("navigation_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCms(["/admin/navigation"]);
  return { success: true };
}

export async function reorderNavigation(orderedIds: string[]) {
  const auth = await requireStaffClient("navigation");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  await Promise.all(
    orderedIds.map((id, index) =>
      auth.supabase!.from("navigation_items").update({ sort_order: index + 1 }).eq("id", id)
    )
  );
  revalidateCms(["/admin/navigation"]);
  return { success: true };
}

export async function registerMediaItem(input: {
  url: string;
  title?: string;
  alt_text?: string;
  bucket?: string;
  folder?: string;
  mime_type?: string;
  media_kind?: "image" | "video" | "document";
  category?: string;
  file_size?: number;
  storage_path?: string;
}) {
  const auth = await requireStaffClient("media");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("media_library").insert({
    url: input.url,
    title: input.title ?? null,
    alt_text: input.alt_text ?? null,
    bucket: input.bucket ?? "website-media",
    folder: input.folder ?? null,
    mime_type: input.mime_type ?? null,
    media_kind: input.media_kind ?? "image",
    category: input.category ?? null,
    file_size: input.file_size ?? null,
    storage_path: input.storage_path ?? null,
  });
  if (error) return { error: error.message };
  revalidateCms(["/admin/media"]);
  return { success: true };
}

export async function updateMediaItem(formData: FormData) {
  const auth = await requireStaffClient("media");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const id = String(formData.get("id") || "");
  const { error } = await auth.supabase
    .from("media_library")
    .update({
      title: String(formData.get("title") || "").trim() || null,
      alt_text: String(formData.get("alt_text") || "").trim() || null,
      category: String(formData.get("category") || "").trim() || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateCms(["/admin/media"]);
  return { success: true };
}

export async function deleteMediaItem(id: string) {
  const auth = await requireStaffClient("media");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("media_library").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCms(["/admin/media"]);
  return { success: true };
}

export async function uploadCmsMedia(formData: FormData) {
  const auth = await requireStaffClient("media");
  if (auth.error) return { url: null, error: auth.error };

  const file = formData.get("file");
  const folder = String(formData.get("folder") || "uploads");
  const category = String(formData.get("category") || folder);
  if (!(file instanceof File) || !file.size) return { url: null, error: "No file selected" };

  const result = await uploadFile("website-media", `${folder}/${Date.now()}-${file.name}`, file);
  if (result.error || !result.url) return result;

  await registerMediaItem({
    url: result.url,
    title: file.name,
    bucket: "website-media",
    folder,
    mime_type: file.type,
    media_kind: file.type.startsWith("video/") ? "video" : "image",
    category,
    file_size: file.size,
  });

  return result;
}

export async function saveInvestorOpportunity(formData: FormData) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    location: String(formData.get("location") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    status: String(formData.get("status") || "open").trim(),
    timeline: String(formData.get("timeline") || "").trim() || null,
    image_url: String(formData.get("image_url") || "").trim() || null,
    investment_requirement: String(formData.get("investment_requirement") || "").trim() || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };
  const { error } = id
    ? await auth.supabase.from("investor_opportunities").update(payload).eq("id", id)
    : await auth.supabase.from("investor_opportunities").insert(payload);
  if (error) return { error: error.message };
  revalidateCms(["/admin/investors", "/investors"]);
  return { success: true };
}

export async function deleteInvestorOpportunity(id: string) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("investor_opportunities").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCms(["/admin/investors", "/investors"]);
  return { success: true };
}

export async function saveInvestorStatistic(formData: FormData) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const id = String(formData.get("id") || "");
  const payload = {
    label: String(formData.get("label") || "").trim(),
    value: String(formData.get("value") || "").trim(),
    sort_order: Number(formData.get("sort_order") || 0),
    published: formData.get("published") === "on",
  };
  if (!payload.label || !payload.value) return { error: "Label and value are required" };
  const { error } = id
    ? await auth.supabase.from("investor_statistics").update(payload).eq("id", id)
    : await auth.supabase.from("investor_statistics").insert(payload);
  if (error) return { error: error.message };
  revalidateCms(["/admin/investors", "/investors"]);
  return { success: true };
}

export async function deleteInvestorStatistic(id: string) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const { error } = await auth.supabase.from("investor_statistics").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCms(["/admin/investors"]);
  return { success: true };
}

export async function saveGalleryCategory(formData: FormData) {
  const auth = await requireStaffClient("content");
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Unauthorized" };
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required" };
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const id = String(formData.get("id") || "");
  const payload = {
    name,
    slug,
    sort_order: Number(formData.get("sort_order") || 0),
    published: formData.get("published") === "on",
  };
  const { error } = id
    ? await auth.supabase.from("gallery_categories").update(payload).eq("id", id)
    : await auth.supabase.from("gallery_categories").insert(payload);
  if (error) return { error: error.message };
  revalidateCms(["/admin/gallery", "/gallery"]);
  return { success: true };
}

export const ALLOWED_UI_STYLES = UI_STYLES;
