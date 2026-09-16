"use server";

import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/src/lib/supabase/admin";
import { getProfile, logActivity } from "@/src/lib/auth/session";
import { isStaffRole, isSuperAdminEmail } from "@/src/lib/permissions/roles";
import { isVideoUrl } from "@/src/lib/utils/media";
import { revalidatePath as nextRevalidatePath, revalidateTag } from "next/cache";
import { denyUnless, denyUnlessId } from "@/src/lib/security/guards";
import { inspectUpload, safeStoragePath, type UploadKind } from "@/src/lib/security/upload";
import { consumeRateLimit, clientFingerprint, recordSecurityEvent } from "@/src/lib/security/rate-limit";
import { contactFormSchema, newsletterSchema, reviewSchema, parseForm } from "@/src/lib/security/validation";
import { publicErrorMessage, logServerError } from "@/src/lib/security/errors";
import { canAssignRole } from "@/src/lib/security/permissions";
import { sanitizeHref } from "@/src/lib/security/urls";
import type { Permission } from "@/src/lib/security/permissions";

function revalidatePath(originalPath: string, type?: "layout" | "page") {
  nextRevalidatePath(originalPath, type);
  revalidateTag("public", "max");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueStoragePath(folder: string, ext: string) {
  return safeStoragePath(folder, ext);
}

type ActionResult = { error?: string; success?: boolean; url?: string | null; id?: string; receipt_number?: string };

async function requirePerm(permission: Permission): Promise<ActionResult> {
  const denied = await denyUnless(permission);
  if (denied.error) return { error: denied.error };
  return {};
}

export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const profile = await getProfile();
  if (!profile || !isStaffRole(profile.role) || !profile.is_active) {
    return { url: null, error: "Unauthorized" };
  }

  const allowed = [
    "founders",
    "services",
    "projects",
    "gallery",
    "news",
    "reviews",
    "employees",
    "receipts",
    "quotations",
    "website-media",
  ];
  if (!allowed.includes(bucket)) {
    return { url: null, error: "Invalid upload destination" };
  }

  const privateBuckets = ["employees", "receipts", "quotations"];
  const isPrivate = privateBuckets.includes(bucket);
  if (isPrivate) {
    const finance = await requirePerm("finance");
    if (finance.error) return { url: null, error: finance.error ?? "Unauthorized" };
  } else {
    const media = await requirePerm("media");
    if (media.error) return { url: null, error: media.error ?? "Unauthorized" };
  }

  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("upload", ipHash);
  if (limit.limited) return { url: null, error: "Too many requests. Try again later." };

  const kind: UploadKind = file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "document" : "image";
  const inspected = await inspectUpload(file, kind);
  if (inspected.error) return { url: null, error: inspected.error };

  const folder = filePath.includes("/")
    ? filePath.slice(0, filePath.lastIndexOf("/"))
    : "uploads";
  const safePath = uniqueStoragePath(folder, inspected.ext);

  if (!hasServiceRole()) {
    return { url: null, error: "Uploads are not available right now." };
  }

  const admin = createAdminClient();

  let { error } = await admin.storage.from(bucket).upload(safePath, file, {
    upsert: false,
    contentType: inspected.mime || file.type || undefined,
  });

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("not found") || msg.includes("bucket") || msg.includes("does not exist")) {
      await admin.storage.createBucket(bucket, {
        public: !isPrivate,
      });
      const retry = await admin.storage.from(bucket).upload(safePath, file, {
        upsert: false,
        contentType: inspected.mime || file.type || undefined,
      });
      error = retry.error;
    }
  }

  if (error) {
    logServerError("upload", error);
    return { url: null, error: "Upload failed. Please try a different file." };
  }

  if (isPrivate) {
    const { data: signed, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrl(safePath, 60 * 60 * 24 * 365 * 2);
    if (signError || !signed?.signedUrl) {
      logServerError("upload-sign", signError ?? "missing signed url");
      return { url: null, error: "Could not create file link" };
    }
    return { url: signed.signedUrl, error: null };
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(safePath);
  return { url: data.publicUrl, error: null };
}

/** FormData-based media upload for admin UI (service role after staff + file inspection). */
export async function uploadMediaAction(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const file = formData.get("file");
  const bucket = formData.get("bucket") as string;
  const folder = (formData.get("folder") as string) || "uploads";

  if (!(file instanceof File) || !file.size) {
    return { url: null, error: "No file selected" };
  }
  if (!bucket) return { url: null, error: "Missing bucket" };

  const kind: UploadKind = file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "document" : "media";
  const inspected = await inspectUpload(file, kind);
  if (inspected.error || !inspected.ext) return { url: null, error: inspected.error ?? "Invalid file" };

  return uploadFile(bucket, uniqueStoragePath(folder, inspected.ext), file);
}

// Services
export async function createService(formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    const supabase = await createClient();
    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "Service name is required" };

    const { error } = await supabase.from("services").insert({
      name,
      slug: slugify(name),
      short_description: (formData.get("short_description") as string) || null,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || null,
      pricing_info: (formData.get("pricing_info") as string) || null,
      icon_name: (formData.get("icon_name") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      status: (formData.get("status") as string) || "draft",
      is_featured: formData.get("is_featured") === "on",
      is_trending: formData.get("is_trending") === "on",
      is_most_requested: formData.get("is_most_requested") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });
    if (error) return { error: error.message };
    await logActivity("create_service", "services", name);
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("createService error:", err);
    return { error: err instanceof Error ? err.message : "Failed to create service" };
  }
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
    const supabase = await createClient();
    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "Service name is required" };

    const { error } = await supabase
      .from("services")
      .update({
        name,
        slug: slugify(name),
        short_description: (formData.get("short_description") as string) || null,
        description: (formData.get("description") as string) || null,
        category: (formData.get("category") as string) || null,
        pricing_info: (formData.get("pricing_info") as string) || null,
        icon_name: (formData.get("icon_name") as string) || null,
        status: (formData.get("status") as string) || "draft",
        is_featured: formData.get("is_featured") === "on",
        is_trending: formData.get("is_trending") === "on",
        is_most_requested: formData.get("is_most_requested") === "on",
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        image_url: (formData.get("image_url") as string) || null,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    await logActivity("update_service", "services", id);
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateService error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update service" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_service", "services", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

// Projects
export async function createProject(formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    const supabase = await createClient();
    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "Project title is required" };

    const { error } = await supabase.from("projects").insert({
      title,
      slug: slugify(title),
      description: (formData.get("description") as string) || null,
      details: (formData.get("details") as string) || null,
      category: (formData.get("category") as string) || null,
      client: (formData.get("client") as string) || null,
      location: (formData.get("location") as string) || null,
      completion_date: (formData.get("completion_date") as string) || null,
      project_status: (formData.get("project_status") as string) || null,
      cover_image_url: (formData.get("cover_image_url") as string) || null,
      status: (formData.get("status") as string) || "draft",
      is_featured: formData.get("is_featured") === "on",
      is_recent: formData.get("is_recent") === "on",
      is_trending: formData.get("is_trending") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    });
    if (error) return { error: error.message };
    await logActivity("create_project", "projects", title);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("createProject error:", err);
    return { error: err instanceof Error ? err.message : "Failed to create project" };
  }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
    const supabase = await createClient();
    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "Project title is required" };

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        slug: slugify(title),
        description: (formData.get("description") as string) || null,
        details: (formData.get("details") as string) || null,
        category: (formData.get("category") as string) || null,
        client: (formData.get("client") as string) || null,
        location: (formData.get("location") as string) || null,
        completion_date: (formData.get("completion_date") as string) || null,
        project_status: (formData.get("project_status") as string) || null,
        cover_image_url: (formData.get("cover_image_url") as string) || null,
        status: (formData.get("status") as string) || "draft",
        is_featured: formData.get("is_featured") === "on",
        is_recent: formData.get("is_recent") === "on",
        is_trending: formData.get("is_trending") === "on",
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    await logActivity("update_project", "projects", id);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateProject error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_project", "projects", id);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

// Gallery
export async function createGalleryItem(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").insert({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image_url: formData.get("image_url") as string,
    category: formData.get("category") as string,
    status: (formData.get("status") as string) || "published",
    sort_order: parseInt(formData.get("sort_order") as string) || 0,
  });
  if (error) return { error: error.message };
  await logActivity("create_gallery_item", "gallery", formData.get("title") as string);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateGalleryItem(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_items")
    .update({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_gallery_item", "gallery", id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

// News
export async function createNews(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const status = (formData.get("status") as string) || "draft";
  const { error } = await supabase.from("news_articles").insert({
    title,
    slug: slugify(title),
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    author: formData.get("author") as string,
    category: formData.get("category") as string,
    featured_image_url: formData.get("featured_image_url") as string,
    meta_title: (formData.get("meta_title") as string) || null,
    meta_description: (formData.get("meta_description") as string) || null,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    status,
    is_featured: formData.get("is_featured") === "on",
    is_trending: formData.get("is_trending") === "on",
    published_at: status === "published" ? new Date().toISOString() : null,
  });
  if (error) return { error: error.message };
  await logActivity("create_news", "news", title);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { success: true };
}

export async function updateNews(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const status = formData.get("status") as string;
  const { error } = await supabase
    .from("news_articles")
    .update({
      title,
      slug: slugify(title),
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      author: formData.get("author") as string,
      category: formData.get("category") as string,
      featured_image_url: formData.get("featured_image_url") as string,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: (formData.get("meta_description") as string) || null,
      tags: String(formData.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
      is_featured: formData.get("is_featured") === "on",
      is_trending: formData.get("is_trending") === "on",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { success: true };
}

export async function deleteNews(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("news_articles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/news");
  return { success: true };
}

// Reviews moderation
export async function updateReviewStatus(id: string, status: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  await logActivity(`review_${status}`, "reviews", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}

// Founder
export async function updateFounder(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("founders")
    .update({
      name: formData.get("name") as string,
      title: formData.get("title") as string,
      biography: formData.get("biography") as string,
      image_url: formData.get("image_url") as string,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_founder", "founders", id);
  revalidatePath("/admin/founder");
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { success: true };
}

// About
export async function updateAboutContent(id: string | null | undefined, formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    if (id) {
      const badId = denyUnlessId(id);
      if (badId) return badId;
    }
    const supabase = await createClient();
    const valuesRaw = (formData.get("values") as string) || "";
    const statsRaw = formData.get("stats") as string;

    let values: string[] = [];
    try {
      const trimmed = valuesRaw.trim();
      if (trimmed.startsWith("[")) {
        values = JSON.parse(trimmed);
      } else {
        values = trimmed
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean);
      }
    } catch {
      values = valuesRaw
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    let stats: { label: string; value: string }[] = [];
    try {
      stats = statsRaw ? JSON.parse(statsRaw) : [];
    } catch {
      return { error: "Invalid stats data" };
    }

    const payload = {
      title: (formData.get("title") as string) || null,
      main_description: (formData.get("main_description") as string) || null,
      company_story: (formData.get("company_story") as string) || null,
      mission: (formData.get("mission") as string) || null,
      vision: (formData.get("vision") as string) || null,
      values,
      stats,
      cta_title: (formData.get("cta_title") as string) || null,
      cta_description: (formData.get("cta_description") as string) || null,
      cta_button_text: (formData.get("cta_button_text") as string) || null,
      cta_button_url: (formData.get("cta_button_url") as string) || null,
    };

    if (id && id.trim()) {
      const { error } = await supabase.from("about_content").update(payload).eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { data: existing } = await supabase.from("about_content").select("id").limit(1).maybeSingle();
      if (existing?.id) {
        const { error } = await supabase.from("about_content").update(payload).eq("id", existing.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await supabase.from("about_content").insert([payload]);
        if (error) return { error: error.message };
      }
    }

    await logActivity("update_about", "about_content", id || "about_content");
    revalidatePath("/admin/about");
    revalidatePath("/about");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (err) {
    console.error("updateAboutContent error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update about content" };
  }
}

// Contact settings
export async function updateContactSettings(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("enquiries");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_settings")
    .update({
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      business_hours: formData.get("business_hours") as string,
      whatsapp: formData.get("whatsapp") as string,
      map_lat: parseFloat(formData.get("map_lat") as string),
      map_lng: parseFloat(formData.get("map_lng") as string),
      map_zoom: parseInt(formData.get("map_zoom") as string) || 13,
      map_marker_title: (formData.get("map_marker_title") as string) || null,
      company_name: (formData.get("company_name") as string) || null,
      company_description: formData.get("company_description") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_contact", "contact_settings", id);
  revalidatePath("/admin/contact");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function markContactMessageRead(id: string, isRead = true): Promise<ActionResult> {
  const denied = await requirePerm("enquiries");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_contact_message", "contact_messages", id);
  revalidatePath("/admin/contact");
  revalidatePath("/admin");
  return { success: true };
}

// Social links
export async function updateSocialLink(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_links")
    .update({
      platform: formData.get("platform") as string,
      url: formData.get("url") as string,
      is_visible: formData.get("is_visible") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  revalidatePath("/admin/contact");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function createSocialLink(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").insert({
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    is_visible: formData.get("is_visible") === "on",
    sort_order: parseInt(formData.get("sort_order") as string) || 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  revalidatePath("/admin/contact");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteSocialLink(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  revalidatePath("/admin/contact");
  revalidatePath("/", "layout");
  return { success: true };
}

// Hero backgrounds
const HERO_PAGE_KEYS = [
  "home",
  "about",
  "services",
  "projects",
  "gallery",
  "news",
  "contact",
  "investors",
] as const;

export async function ensureHeroPages(): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { data } = await supabase.from("hero_backgrounds").select("page_key");
  const existing = new Set((data ?? []).map((row) => row.page_key));
  const missing = HERO_PAGE_KEYS.filter((key) => !existing.has(key));
  if (missing.length === 0) return { success: true };

  await supabase.from("hero_backgrounds").insert(
    missing.map((page_key) => ({
      page_key,
      background_type: "image",
      overlay_color: "#0A2540",
      overlay_opacity: 0.6,
      is_active: true,
    }))
  );
  revalidatePath("/admin/heroes");
  return { success: true };
}

export async function updateHeroBackground(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const denied = await requirePerm("content");
    if (denied.error) return denied;
    const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
    const supabase = await createClient();
    const overlayColor = "#0A2540";
    const overlayOpacity = 0.6;
    const backgroundUrl = (formData.get("background_url") as string | null)?.trim() || null;

    const payload = {
      background_type: "image" as const,
      background_url: backgroundUrl,
      mobile_background_url: (formData.get("mobile_background_url") as string | null)?.trim() || null,
      overlay_color: overlayColor,
      overlay_opacity: overlayOpacity,
      is_active: formData.get("is_active") === "on",
    };

    const { error } = await supabase.from("hero_backgrounds").update(payload).eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/heroes");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/services");
    revalidatePath("/projects");
    revalidatePath("/gallery");
    revalidatePath("/news");
    revalidatePath("/contact");
    revalidatePath("/investors");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateHeroBackground error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update hero background" };
  }
}

// Newsletter admin
export async function deactivateSubscriber(id: string): Promise<ActionResult> {
  const denied = await requirePerm("enquiries");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  const denied = await requirePerm("enquiries");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/newsletter");
  return { success: true };
}

// Employees
export async function createEmployee(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("hr");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("employees").insert({
    employee_id: formData.get("employee_id") as string,
    full_name: formData.get("full_name") as string,
    position: formData.get("position") as string,
    department: formData.get("department") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    employment_date: (formData.get("employment_date") as string) || null,
    salary: parseFloat(formData.get("salary") as string) || null,
    status: (formData.get("status") as string) || "active",
    notes: formData.get("notes") as string,
    profile_image_url: formData.get("profile_image_url") as string,
  });
  if (error) return { error: error.message };
  await logActivity("create_employee", "employees", formData.get("full_name") as string);
  revalidatePath("/admin/employees");
  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("hr");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("employees")
    .update({
      employee_id: formData.get("employee_id") as string,
      full_name: formData.get("full_name") as string,
      position: formData.get("position") as string,
      department: formData.get("department") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      employment_date: (formData.get("employment_date") as string) || null,
      salary: parseFloat(formData.get("salary") as string) || null,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
      profile_image_url: formData.get("profile_image_url") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_employee", "employees", id);
  revalidatePath("/admin/employees");
  return { success: true };
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  const denied = await requirePerm("hr");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/employees");
  return { success: true };
}

// Payroll
export async function createPayrollRecord(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const supabase = await createClient();
  const basic = parseFloat(formData.get("basic_salary") as string) || 0;
  const allowances = parseFloat(formData.get("allowances") as string) || 0;
  const bonuses = parseFloat(formData.get("bonuses") as string) || 0;
  const deductions = parseFloat(formData.get("deductions") as string) || 0;
  const net = basic + allowances + bonuses - deductions;

  const { error } = await supabase.from("payroll_records").insert({
    employee_id: formData.get("employee_id") as string,
    pay_period_start: formData.get("pay_period_start") as string,
    pay_period_end: formData.get("pay_period_end") as string,
    basic_salary: basic,
    allowances,
    bonuses,
    deductions,
    net_salary: net,
    payment_status: (formData.get("payment_status") as string) || "pending",
    payment_date: (formData.get("payment_date") as string) || null,
    notes: formData.get("notes") as string,
  });
  if (error) return { error: error.message };
  await logActivity("create_payroll", "payroll", formData.get("employee_id") as string);
  revalidatePath("/admin/payroll");
  return { success: true };
}

export async function updatePayrollRecord(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const basic = parseFloat(formData.get("basic_salary") as string) || 0;
  const allowances = parseFloat(formData.get("allowances") as string) || 0;
  const bonuses = parseFloat(formData.get("bonuses") as string) || 0;
  const deductions = parseFloat(formData.get("deductions") as string) || 0;
  const net = basic + allowances + bonuses - deductions;

  const { error } = await supabase
    .from("payroll_records")
    .update({
      employee_id: formData.get("employee_id") as string,
      pay_period_start: formData.get("pay_period_start") as string,
      pay_period_end: formData.get("pay_period_end") as string,
      basic_salary: basic,
      allowances,
      bonuses,
      deductions,
      net_salary: net,
      payment_status: formData.get("payment_status") as string,
      payment_date: (formData.get("payment_date") as string) || null,
      notes: formData.get("notes") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/payroll");
  return { success: true };
}

export async function deletePayrollRecord(id: string): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("payroll_records").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/payroll");
  return { success: true };
}

// Expenses
export async function createExpense(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    amount: parseFloat(formData.get("amount") as string) || 0,
    currency: (formData.get("currency") as string) || "USD",
    expense_date: formData.get("expense_date") as string,
    vendor: formData.get("vendor") as string,
    description: formData.get("description") as string,
    receipt_url: formData.get("receipt_url") as string,
    payment_method: formData.get("payment_method") as string,
    status: (formData.get("status") as string) || "recorded",
  });
  if (error) return { error: error.message };
  await logActivity("create_expense", "expenses", formData.get("name") as string);
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      currency: formData.get("currency") as string,
      expense_date: formData.get("expense_date") as string,
      vendor: formData.get("vendor") as string,
      description: formData.get("description") as string,
      receipt_url: formData.get("receipt_url") as string,
      payment_method: formData.get("payment_method") as string,
      status: formData.get("status") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  return { success: true };
}

// Quotations
export async function createQuotation(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const supabase = await createClient();
  const itemsJson = formData.get("items") as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];

  const labour = parseFloat(formData.get("labour_total") as string) || 0;
  const materials = parseFloat(formData.get("materials_total") as string) || 0;
  const equipment = parseFloat(formData.get("equipment_total") as string) || 0;
  const discount = parseFloat(formData.get("discount") as string) || 0;
  const taxRate = parseFloat(formData.get("tax_rate") as string) || 0;
  const subtotal = labour + materials + equipment + items.reduce((s: number, i: { quantity: number; unit_price: number }) => s + i.quantity * i.unit_price, 0);
  const afterDiscount = subtotal - discount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  const quoteNumber = `WE-${Date.now().toString().slice(-8)}`;

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      quote_number: quoteNumber,
      quote_date: (formData.get("quote_date") as string) || new Date().toISOString().split("T")[0],
      expiry_date: (formData.get("expiry_date") as string) || null,
      client_name: formData.get("client_name") as string,
      client_address: formData.get("client_address") as string,
      client_email: formData.get("client_email") as string,
      client_phone: formData.get("client_phone") as string,
      project_name: formData.get("project_name") as string,
      project_location: formData.get("project_location") as string,
      description: formData.get("description") as string,
      labour_total: labour,
      materials_total: materials,
      equipment_total: equipment,
      subtotal,
      discount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      terms_and_conditions: formData.get("terms_and_conditions") as string,
      payment_terms: formData.get("payment_terms") as string,
      notes: formData.get("notes") as string,
      status: (formData.get("status") as string) || "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (items.length > 0 && data) {
    await supabase.from("quotation_items").insert(
      items.map((item: { description: string; quantity: number; unit: string; unit_price: number; item_type: string }, idx: number) => ({
        quotation_id: data.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        item_type: item.item_type,
        sort_order: idx,
      }))
    );
  }

  await logActivity("create_quotation", "quotations", data?.id);
  revalidatePath("/admin/quotations");
  return { success: true, id: data?.id };
}

export async function deleteQuotation(id: string): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  await supabase.from("quotation_items").delete().eq("quotation_id", id);
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_quotation", "quotations", id);
  revalidatePath("/admin/quotations");
  return { success: true };
}

export async function duplicateQuotation(id: string): Promise<ActionResult> {
  const denied = await requirePerm("finance");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quote) return { error: "Not found" };

  const { data: items } = await supabase.from("quotation_items").select("*").eq("quotation_id", id);

  const { data: newQuote, error } = await supabase
    .from("quotations")
    .insert({
      ...quote,
      id: undefined,
      quote_number: `WE-${Date.now().toString().slice(-8)}`,
      quote_date: new Date().toISOString().split("T")[0],
      status: "draft",
      created_at: undefined,
      updated_at: undefined,
    })
    .select("id")
    .single();

  if (error || !newQuote) return { error: error?.message || "Failed" };

  if (items?.length) {
    await supabase.from("quotation_items").insert(
      items.map((item) => ({
        quotation_id: newQuote.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        item_type: item.item_type,
        sort_order: item.sort_order,
      }))
    );
  }

  revalidatePath("/admin/quotations");
  return { success: true, id: newQuote.id };
}

// AI Knowledge
export async function createKnowledge(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("ai_knowledge").insert({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    source: (formData.get("source") as string) || "manual",
    keywords: formData.get("keywords") ? JSON.parse(formData.get("keywords") as string) : [],
    is_active: formData.get("is_active") === "on",
  });
  if (error) return { error: error.message };
  await logActivity("create_knowledge", "ai_knowledge", formData.get("title") as string);
  revalidatePath("/admin/miwilly");
  return { success: true };
}

export async function updateKnowledge(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_knowledge")
    .update({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      category: formData.get("category") as string,
      source: formData.get("source") as string,
      keywords: formData.get("keywords") ? JSON.parse(formData.get("keywords") as string) : [],
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_knowledge", "ai_knowledge", id);
  revalidatePath("/admin/miwilly");
  return { success: true };
}

export async function deleteKnowledge(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("ai_knowledge").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/miwilly");
  return { success: true };
}

// FAQs
export async function createFaq(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({
    question: formData.get("question") as string,
    answer: formData.get("answer") as string,
    category: (formData.get("category") as string) || null,
    is_published: formData.get("is_published") === "on",
    sort_order: parseInt(formData.get("sort_order") as string) || 0,
  });
  if (error) return { error: error.message };
  await logActivity("create_faq", "faqs", formData.get("question") as string);
  revalidatePath("/admin/faq");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}

export async function updateFaq(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("faqs")
    .update({
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      category: (formData.get("category") as string) || null,
      is_published: formData.get("is_published") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_faq", "faqs", id);
  revalidatePath("/admin/faq");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_faq", "faqs", id);
  revalidatePath("/admin/faq");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}

// Users
export async function updateUserRole(userId: string, role: string): Promise<ActionResult> {
  const denied = await denyUnless("users");
  if (denied.error || !denied.profile) return { error: "Unauthorized" };
  const _badId = denyUnlessId(userId);
  if (_badId.error) return _badId;
  if (!canAssignRole(denied.profile, role)) return { error: "Invalid role" };
  if (denied.profile.id === userId && role !== denied.profile.role) {
    return { error: "You cannot change your own role." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase.from("profiles").select("email, role").eq("id", userId).maybeSingle();
  if (!target) return { error: "User not found" };
  if (isSuperAdminEmail(target.email) || target.role === "super_admin") {
    return { error: "The super admin account cannot be changed." };
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: publicErrorMessage(error) };
  await logActivity("UPDATE_USER_ROLE", "profiles", userId, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserName(userId: string, fullName: string): Promise<ActionResult> {
  const denied = await denyUnless("users");
  if (denied.error) return { error: denied.error };
  const _badId = denyUnlessId(userId);
  if (_badId.error) return _badId;
  const name = fullName.trim();
  if (name.length < 2 || name.length > 120) return { error: "Name is required" };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId);
  if (error) return { error: publicErrorMessage(error) };
  await logActivity("update_user_name", "profiles", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const denied = await denyUnless("users");
  if (denied.error || !denied.profile) return { error: "Unauthorized" };
  const _badId = denyUnlessId(userId);
  if (_badId.error) return _badId;
  if (denied.profile.id === userId) return { error: "You cannot deactivate your own account." };

  const supabase = await createClient();
  const { data: target } = await supabase.from("profiles").select("email, role").eq("id", userId).maybeSingle();
  if (target && (isSuperAdminEmail(target.email) || target.role === "super_admin") && !isActive) {
    return { error: "The super admin account cannot be deactivated." };
  }

  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: publicErrorMessage(error) };
  await logActivity("toggle_user_active", "profiles", userId, { isActive });
  revalidatePath("/admin/users");
  return { success: true };
}

// POS
export async function createPosSale(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("pos");
  if (denied.error) return denied;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "manager", "sales_manager", "staff"].includes(profile.role)) {
    return { error: "Not authorized for POS" };
  }

  const itemsJson = formData.get("items") as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];
  if (!items.length) return { error: "Add at least one item" };

  const discount = parseFloat(formData.get("discount") as string) || 0;
  const taxRate = parseFloat(formData.get("tax_rate") as string) || 0;
  const subtotal = items.reduce(
    (s: number, i: { quantity: number; unit_price: number }) => s + Number(i.quantity) * Number(i.unit_price),
    0
  );
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  const receiptNumber = `POS-${Date.now().toString().slice(-10)}`;

  const { data: sale, error } = await supabase
    .from("pos_sales")
    .insert({
      receipt_number: receiptNumber,
      client_name: (formData.get("client_name") as string) || null,
      client_phone: (formData.get("client_phone") as string) || null,
      client_email: (formData.get("client_email") as string) || null,
      payment_method: (formData.get("payment_method") as string) || "cash",
      notes: (formData.get("notes") as string) || null,
      subtotal,
      discount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: (formData.get("currency") as string) || "USD",
      status: "completed",
      recorded_by: user.id,
      recorded_by_name: profile.full_name || profile.email.split("@")[0],
      recorded_by_email: profile.email,
    })
    .select("id, receipt_number")
    .single();

  if (error || !sale) return { error: error?.message || "Failed to create sale" };

  const { error: itemsError } = await supabase.from("pos_sale_items").insert(
    items.map(
      (
        item: {
          item_type: string;
          description: string;
          quantity: number;
          unit: string;
          unit_price: number;
        },
        idx: number
      ) => ({
        sale_id: sale.id,
        item_type: item.item_type || "service",
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit || "unit",
        unit_price: Number(item.unit_price),
        line_total: Number(item.quantity) * Number(item.unit_price),
        sort_order: idx,
      })
    )
  );

  if (itemsError) return { error: itemsError.message };

  await logActivity("create_pos_sale", "pos_sales", sale.id, {
    receipt_number: sale.receipt_number,
    total,
  });
  revalidatePath("/admin/pos");
  return { success: true, id: sale.id, receipt_number: sale.receipt_number };
}

export async function deletePosSale(id: string): Promise<ActionResult> {
  const denied = await requirePerm("pos");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  await supabase.from("pos_sale_items").delete().eq("sale_id", id);
  const { error } = await supabase.from("pos_sales").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_pos_sale", "pos_sales", id);
  revalidatePath("/admin/pos");
  return { success: true };
}

// Site settings
export async function updateSiteSetting(key: string, value: string): Promise<ActionResult> {
  const denied = await requirePerm("settings");
  if (denied.error) return denied;
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return { error: error.message };
  await logActivity("update_settings", "site_settings", key);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Home showcase
export async function updateShowcaseSettings(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_showcase_settings")
    .update({
      is_enabled: formData.get("is_enabled") === "on",
      eyebrow: (formData.get("eyebrow") as string) || null,
      heading: (formData.get("heading") as string) || null,
      description: (formData.get("description") as string) || null,
      cta_label: (formData.get("cta_label") as string) || null,
      cta_url: (formData.get("cta_url") as string) || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_showcase_settings", "home_showcase_settings", id);
  revalidatePath("/admin/showcase");
  revalidatePath("/");
  return { success: true };
}

export async function createShowcaseItem(formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const supabase = await createClient();
  const mediaUrl = formData.get("media_url") as string;
  if (!mediaUrl) return { error: "Media is required" };
  const mediaType = (formData.get("media_type") as string) === "video" || isVideoUrl(mediaUrl) ? "video" : "image";

  const { error } = await supabase.from("home_showcase_items").insert({
    title: formData.get("title") as string,
    caption: (formData.get("caption") as string) || null,
    media_url: mediaUrl,
    media_type: mediaType,
    sort_order: parseInt(formData.get("sort_order") as string) || 0,
    is_active: formData.get("is_active") === "on",
  });
  if (error) return { error: error.message };
  await logActivity("create_showcase_item", "home_showcase_items", formData.get("title") as string);
  revalidatePath("/admin/showcase");
  revalidatePath("/");
  return { success: true };
}

export async function updateShowcaseItem(id: string, formData: FormData): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const mediaUrl = formData.get("media_url") as string;
  if (!mediaUrl) return { error: "Media is required" };
  const mediaType = (formData.get("media_type") as string) === "video" || isVideoUrl(mediaUrl) ? "video" : "image";

  const { error } = await supabase
    .from("home_showcase_items")
    .update({
      title: formData.get("title") as string,
      caption: (formData.get("caption") as string) || null,
      media_url: mediaUrl,
      media_type: mediaType,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_showcase_item", "home_showcase_items", id);
  revalidatePath("/admin/showcase");
  revalidatePath("/");
  return { success: true };
}

export async function deleteShowcaseItem(id: string): Promise<ActionResult> {
  const denied = await requirePerm("content");
  if (denied.error) return denied;
  const _badId = denyUnlessId(id);
  if (_badId.error) return _badId;
  const supabase = await createClient();
  const { error } = await supabase.from("home_showcase_items").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_showcase_item", "home_showcase_items", id);
  revalidatePath("/admin/showcase");
  revalidatePath("/");
  return { success: true };
}

// Public actions
export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  if (String(formData.get("website") ?? "")) {
    return { success: true };
  }
  const parsed = parseForm(contactFormSchema, {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: String(formData.get("source") ?? "contact"),
    enquiry_type: String(formData.get("enquiry_type") ?? ""),
    website: String(formData.get("website") ?? ""),
  });
  if (parsed.error || !parsed.data) return { error: "Please check your details and try again." };

  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("contact", `${ipHash}:${parsed.data.email}`);
  if (limit.limited) return { error: "Too many requests. Try again later." };

  const source = parsed.data.source ?? "contact";
  const enquiry = parsed.data.enquiry_type ?? "";
  const prefix =
    source === "investor" || enquiry.toLowerCase().includes("invest")
      ? "[Investor inquiry]"
      : enquiry
        ? `[${enquiry.slice(0, 80)}]`
        : "";
  const message = [prefix, parsed.data.message].filter(Boolean).join("\n\n");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message,
  });
  if (error) {
    logServerError("contact", error);
    return { error: "Unable to send your message right now." };
  }
  await recordSecurityEvent({ eventType: "CONTACT_SUBMIT", email: parsed.data.email, success: true });
  return { success: true };
}

export async function subscribeNewsletter(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(newsletterSchema, {
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (parsed.error || !parsed.data) return { error: "Please enter a valid email address." };

  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("newsletter", `${ipHash}:${parsed.data.email}`);
  if (limit.limited) return { error: "Too many requests. Try again later." };

  const supabase = await createClient();
  const email = parsed.data.email;
  const name = parsed.data.name || null;

  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, is_active")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) return { error: "This email is already subscribed." };
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: true, unsubscribed_at: null, name })
      .eq("id", existing.id);
    if (error) return { error: "Unable to subscribe right now." };
    return { success: true };
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({ email, name });
  if (error) return { error: "Unable to subscribe right now." };
  return { success: true };
}

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(reviewSchema, {
    name: String(formData.get("name") ?? ""),
    company_name: String(formData.get("company_name") ?? ""),
    rating: formData.get("rating"),
    review_text: String(formData.get("review_text") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
  });
  if (parsed.error || !parsed.data) return { error: "Please check your review and try again." };

  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("review", ipHash);
  if (limit.limited) return { error: "Too many requests. Try again later." };

  const imageUrl = parsed.data.image_url ? sanitizeHref(parsed.data.image_url, "") : "";
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    name: parsed.data.name,
    company_name: parsed.data.company_name || null,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text,
    image_url: imageUrl || null,
    status: "pending",
  });
  if (error) return { error: "Unable to submit your review right now." };
  return { success: true };
}

export async function uploadReviewImage(formData: FormData): Promise<ActionResult> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file." };
  }
  const inspected = await inspectUpload(file, "image");
  if (inspected.error || !inspected.ext) return { error: inspected.error ?? "Invalid image" };

  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("upload", `review:${ipHash}`);
  if (limit.limited) return { error: "Too many requests. Try again later." };

  if (!hasServiceRole()) return { error: "Uploads are not available right now." };
  const admin = createAdminClient();
  const path = uniqueStoragePath("submissions", inspected.ext);

  let { error } = await admin.storage.from("reviews").upload(path, file, {
    upsert: false,
    contentType: inspected.mime,
  });

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("not found") || msg.includes("bucket") || msg.includes("does not exist")) {
      await admin.storage.createBucket("reviews", { public: true });
      const retry = await admin.storage.from("reviews").upload(path, file, {
        upsert: false,
        contentType: inspected.mime,
      });
      error = retry.error;
    }
  }

  if (error) return { error: "Unable to upload that image." };

  const { data } = admin.storage.from("reviews").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

