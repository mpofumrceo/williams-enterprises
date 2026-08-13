"use server";

import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getProfile, logActivity } from "@/src/lib/auth/session";
import { isStaffRole, isSuperAdminEmail } from "@/src/lib/permissions/roles";
import { isVideoUrl } from "@/src/lib/utils/media";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uploadFile(
  bucket: string,
  path: string,
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
  ];
  if (!allowed.includes(bucket)) {
    return { url: null, error: "Invalid upload destination" };
  }

  const admin = createAdminClient();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      url: null,
      error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. Add it from Supabase → Settings → API.",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filePath = `${path}/${Date.now()}.${ext}`;

  const { error } = await admin.storage.from(bucket).upload(filePath, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) return { url: null, error: error.message };

  const privateBuckets = ["employees", "receipts", "quotations"];
  if (privateBuckets.includes(bucket)) {
    const { data: signed, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 2);
    if (signError || !signed?.signedUrl) {
      return { url: null, error: signError?.message || "Could not create file link" };
    }
    return { url: signed.signedUrl, error: null };
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
}

/** FormData-based media upload for admin UI (bypasses storage RLS via service role). */
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

  return uploadFile(bucket, folder, file);
}

// Services
export async function createService(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const { error } = await supabase.from("services").insert({
    name,
    slug: slugify(name),
    short_description: formData.get("short_description") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    pricing_info: formData.get("pricing_info") as string,
    icon_name: formData.get("icon_name") as string,
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
  return { success: true };
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const { error } = await supabase
    .from("services")
    .update({
      name,
      slug: slugify(name),
      short_description: formData.get("short_description") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      pricing_info: formData.get("pricing_info") as string,
      icon_name: formData.get("icon_name") as string,
      status: formData.get("status") as string,
      is_featured: formData.get("is_featured") === "on",
      is_trending: formData.get("is_trending") === "on",
      is_most_requested: formData.get("is_most_requested") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      image_url: (formData.get("image_url") as string) || undefined,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_service", "services", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_service", "services", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

// Projects
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const { error } = await supabase.from("projects").insert({
    title,
    slug: slugify(title),
    description: formData.get("description") as string,
    details: formData.get("details") as string,
    category: formData.get("category") as string,
    client: formData.get("client") as string,
    location: formData.get("location") as string,
    completion_date: (formData.get("completion_date") as string) || null,
    project_status: formData.get("project_status") as string,
    cover_image_url: formData.get("cover_image_url") as string,
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
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const { error } = await supabase
    .from("projects")
    .update({
      title,
      slug: slugify(title),
      description: formData.get("description") as string,
      details: formData.get("details") as string,
      category: formData.get("category") as string,
      client: formData.get("client") as string,
      location: formData.get("location") as string,
      completion_date: (formData.get("completion_date") as string) || null,
      project_status: formData.get("project_status") as string,
      cover_image_url: formData.get("cover_image_url") as string,
      status: formData.get("status") as string,
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
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_project", "projects", id);
  revalidatePath("/admin/projects");
  return { success: true };
}

// Gallery
export async function createGalleryItem(formData: FormData) {
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
  return { success: true };
}

export async function updateGalleryItem(id: string, formData: FormData) {
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
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_gallery_item", "gallery", id);
  revalidatePath("/admin/gallery");
  return { success: true };
}

// News
export async function createNews(formData: FormData) {
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

export async function updateNews(id: string, formData: FormData) {
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

export async function deleteNews(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("news_articles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/news");
  return { success: true };
}

// Reviews moderation
export async function updateReviewStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  await logActivity(`review_${status}`, "reviews", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true };
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}

// Founder
export async function updateFounder(id: string, formData: FormData) {
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
  return { success: true };
}

// About
export async function updateAboutContent(id: string, formData: FormData) {
  const supabase = await createClient();
  const valuesRaw = (formData.get("values") as string) || "";
  const statsRaw = formData.get("stats") as string;

  let values: string[] = [];
  try {
    // Prefer JSON array; fall back to one-value-per-line
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

  const { error } = await supabase
    .from("about_content")
    .update({
      title: formData.get("title") as string,
      main_description: formData.get("main_description") as string,
      company_story: formData.get("company_story") as string,
      mission: formData.get("mission") as string,
      vision: formData.get("vision") as string,
      values,
      stats,
      cta_title: formData.get("cta_title") as string,
      cta_description: formData.get("cta_description") as string,
      cta_button_text: formData.get("cta_button_text") as string,
      cta_button_url: formData.get("cta_button_url") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_about", "about_content", id);
  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}

// Contact settings
export async function updateContactSettings(id: string, formData: FormData) {
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
      company_description: formData.get("company_description") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActivity("update_contact", "contact_settings", id);
  revalidatePath("/admin/contact");
  revalidatePath("/contact");
  return { success: true };
}

// Social links
export async function updateSocialLink(id: string, formData: FormData) {
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
  return { success: true };
}

export async function createSocialLink(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").insert({
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    is_visible: formData.get("is_visible") === "on",
    sort_order: parseInt(formData.get("sort_order") as string) || 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  return { success: true };
}

export async function deleteSocialLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  return { success: true };
}

// Hero backgrounds
export async function updateHeroBackground(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_backgrounds")
    .update({
      background_type: formData.get("background_type") as string,
      background_url: formData.get("background_url") as string,
      mobile_background_url: formData.get("mobile_background_url") as string,
      overlay_color: formData.get("overlay_color") as string,
      overlay_opacity: parseFloat(formData.get("overlay_opacity") as string) || 0.85,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/heroes");
  return { success: true };
}

// Newsletter admin
export async function deactivateSubscriber(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function deleteSubscriber(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/newsletter");
  return { success: true };
}

// Employees
export async function createEmployee(formData: FormData) {
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

export async function updateEmployee(id: string, formData: FormData) {
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

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/employees");
  return { success: true };
}

// Payroll
export async function createPayrollRecord(formData: FormData) {
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

export async function updatePayrollRecord(id: string, formData: FormData) {
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

export async function deletePayrollRecord(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payroll_records").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/payroll");
  return { success: true };
}

// Expenses
export async function createExpense(formData: FormData) {
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

export async function updateExpense(id: string, formData: FormData) {
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

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  return { success: true };
}

// Quotations
export async function createQuotation(formData: FormData) {
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

export async function deleteQuotation(id: string) {
  const supabase = await createClient();
  await supabase.from("quotation_items").delete().eq("quotation_id", id);
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_quotation", "quotations", id);
  revalidatePath("/admin/quotations");
  return { success: true };
}

export async function duplicateQuotation(id: string) {
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
export async function createKnowledge(formData: FormData) {
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

export async function updateKnowledge(id: string, formData: FormData) {
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

export async function deleteKnowledge(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_knowledge").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/miwilly");
  return { success: true };
}

// FAQs
export async function createFaq(formData: FormData) {
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

export async function updateFaq(id: string, formData: FormData) {
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

export async function deleteFaq(id: string) {
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
export async function updateUserRole(userId: string, role: string) {
  const allowed = ["admin", "manager", "sales_manager", "staff", "user"];
  if (!allowed.includes(role)) return { error: "Invalid role" };

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("email, role").eq("id", userId).single();
  if (target && isSuperAdminEmail(target.email)) {
    if (role !== "admin") {
      return { error: "The super admin account cannot be changed from Admin." };
    }
  }

  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  await logActivity("update_user_role", "profiles", userId, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserName(userId: string, fullName: string) {
  const name = fullName.trim();
  if (!name) return { error: "Name is required" };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ full_name: name }).eq("id", userId);
  if (error) return { error: error.message };
  await logActivity("update_user_name", "profiles", userId, { full_name: name });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("email").eq("id", userId).single();
  if (target && isSuperAdminEmail(target.email) && !isActive) {
    return { error: "The super admin account cannot be deactivated." };
  }

  const { error } = await admin.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

// POS
export async function createPosSale(formData: FormData) {
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

export async function deletePosSale(id: string) {
  const supabase = await createClient();
  await supabase.from("pos_sale_items").delete().eq("sale_id", id);
  const { error } = await supabase.from("pos_sales").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_pos_sale", "pos_sales", id);
  revalidatePath("/admin/pos");
  return { success: true };
}

// Site settings
export async function updateSiteSetting(key: string, value: string) {
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
export async function updateShowcaseSettings(id: string, formData: FormData) {
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

export async function createShowcaseItem(formData: FormData) {
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

export async function updateShowcaseItem(id: string, formData: FormData) {
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

export async function deleteShowcaseItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_showcase_items").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("delete_showcase_item", "home_showcase_items", id);
  revalidatePath("/admin/showcase");
  revalidatePath("/");
  return { success: true };
}

// Public actions
export async function submitContactForm(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    message: formData.get("message") as string,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function subscribeNewsletter(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const name = (formData.get("name") as string) || null;

  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, is_active")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.is_active) return { error: "This email is already subscribed." };
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: true, unsubscribed_at: null, name })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { success: true };
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({ email, name });
  if (error) return { error: error.message };
  return { success: true };
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    name: formData.get("name") as string,
    company_name: (formData.get("company_name") as string) || null,
    rating: parseInt(formData.get("rating") as string) || 5,
    review_text: formData.get("review_text") as string,
    image_url: (formData.get("image_url") as string) || null,
    status: "pending",
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadReviewImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Image must be under 10MB." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await admin.storage.from("reviews").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return { error: error.message };

  const { data } = admin.storage.from("reviews").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
