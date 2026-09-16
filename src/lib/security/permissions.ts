import type { Profile, UserRole } from "@/src/types/database";
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from "@/src/lib/permissions/roles";

export type Permission =
  | "dashboard"
  | "content"
  | "media"
  | "design"
  | "navigation"
  | "settings"
  | "enquiries"
  | "users"
  | "security"
  | "activity"
  | "finance"
  | "hr"
  | "pos"
  | "ai";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard",
  "content",
  "media",
  "design",
  "navigation",
  "settings",
  "enquiries",
  "users",
  "security",
  "activity",
  "finance",
  "hr",
  "pos",
  "ai",
];

const ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  (item) => item !== "users" && item !== "security"
);

const EDITOR_PERMISSIONS: Permission[] = ["dashboard", "content", "media", "pos"];

export function isSuperAdminProfile(profile: Pick<Profile, "email" | "role"> | null | undefined) {
  if (!profile) return false;
  return profile.role === "super_admin" || isSuperAdminEmail(profile.email);
}

export function permissionsFor(profile: Pick<Profile, "email" | "role" | "is_active"> | null | undefined): Permission[] {
  if (!profile?.is_active) return [];
  if (isSuperAdminProfile(profile)) return ALL_PERMISSIONS;

  switch (profile.role) {
    case "admin":
      return ADMIN_PERMISSIONS;
    case "manager":
      return ADMIN_PERMISSIONS;
    case "editor":
    case "staff":
      return EDITOR_PERMISSIONS;
    case "sales_manager":
      return EDITOR_PERMISSIONS;
    default:
      return [];
  }
}

export function hasPermission(
  profile: Pick<Profile, "email" | "role" | "is_active"> | null | undefined,
  permission: Permission
) {
  return permissionsFor(profile).includes(permission);
}

const ADMIN_ROUTE_PERMISSIONS: Array<[string, Permission]> = [
  ["/admin/users", "users"],
  ["/admin/security", "security"],
  ["/admin/activity", "activity"],
  ["/admin/settings", "settings"],
  ["/admin/employees", "hr"],
  ["/admin/payroll", "finance"],
  ["/admin/expenses", "finance"],
  ["/admin/quotations", "finance"],
  ["/admin/pos", "pos"],
  ["/admin/newsletter", "enquiries"],
  ["/admin/enquiries", "enquiries"],
  ["/admin/contact", "enquiries"],
  ["/admin/miwilly", "ai"],
  ["/admin/media", "media"],
  ["/admin/theme", "design"],
  ["/admin/navigation", "navigation"],
  ["/admin/footer", "navigation"],
  ["/admin/website", "content"],
  ["/admin/services", "content"],
  ["/admin/projects", "content"],
  ["/admin/gallery", "content"],
  ["/admin/news", "content"],
  ["/admin/investors", "content"],
  ["/admin/social", "content"],
  ["/admin/about", "content"],
  ["/admin/heroes", "content"],
  ["/admin/showcase", "content"],
  ["/admin/founder", "content"],
  ["/admin/reviews", "content"],
  ["/admin/faq", "content"],
];

export function permissionForAdminPath(pathname: string): Permission {
  const match = ADMIN_ROUTE_PERMISSIONS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return match?.[1] ?? "dashboard";
}

export function canAssignRole(actor: Profile, targetRole: string) {
  if (!isSuperAdminProfile(actor)) return false;
  const allowed: UserRole[] = ["super_admin", "admin", "editor", "manager", "sales_manager", "staff", "user"];
  if (!(allowed as string[]).includes(targetRole)) return false;
  if (targetRole === "super_admin" && !isSuperAdminEmail(actor.email) && actor.role !== "super_admin") {
    return false;
  }
  return true;
}

export { SUPER_ADMIN_EMAIL };
