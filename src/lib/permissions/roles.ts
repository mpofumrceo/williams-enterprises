import type { UserRole } from "@/src/types/database";

/** Locked owner account — cannot be demoted or deactivated. */
export const SUPER_ADMIN_EMAIL = "williamsenterprisess@gmail.com";

const STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "editor",
  "manager",
  "sales_manager",
  "staff",
];
const POS_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "editor",
  "manager",
  "sales_manager",
  "staff",
];

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === "super_admin" || role === "admin" || role === "manager";
}

export function isStaffRole(role: UserRole | string | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role as UserRole);
}

export function canUsePOS(role: UserRole | string | null | undefined): boolean {
  return role != null && POS_ROLES.includes(role as UserRole);
}

export function canManageUsers(role: UserRole | string | null | undefined, email?: string | null): boolean {
  return role === "super_admin" || isSuperAdminEmail(email);
}

export function canAccessFinance(role: UserRole | string | null | undefined): boolean {
  return role === "super_admin" || role === "admin" || role === "manager";
}

export function canAccessHR(role: UserRole | string | null | undefined): boolean {
  return role === "super_admin" || role === "admin" || role === "manager";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  manager: "Manager",
  sales_manager: "Sales Manager",
  staff: "Staff",
  user: "User",
};
