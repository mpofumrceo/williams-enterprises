"use server";

import { createClient } from "@/src/lib/supabase/server";
import { isStaffRole } from "@/src/lib/permissions/roles";
import { hasPermission, type Permission } from "@/src/lib/security/permissions";
import type { Profile } from "@/src/types/database";
import { redirect } from "next/navigation";

function isStaleSessionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("Invalid Refresh Token") || message.includes("refresh_token_already_used");
}

export async function getSession() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    if (isStaleSessionError(error)) return null;
    throw error;
  }
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return (data as Profile | null) ?? null;
  } catch (error) {
    if (isStaleSessionError(error)) return null;
    throw error;
  }
}

export async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !isStaffRole(profile.role) || !profile.is_active) {
    redirect("/portal/auth");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireStaff();
  if (!hasPermission(profile, "settings")) {
    redirect("/admin");
  }
  return profile;
}

export async function requirePermission(permission: Permission) {
  const profile = await requireStaff();
  if (!hasPermission(profile, permission)) {
    redirect("/admin");
  }
  return profile;
}

export async function logActivity(
  action: string,
  entity?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const safeMeta =
      metadata && typeof metadata === "object"
        ? Object.fromEntries(
            Object.entries(metadata).filter(
              ([key]) => !/password|token|secret|key|authorization/i.test(key)
            )
          )
        : null;

    await supabase.from("activity_logs").insert({
      user_id: user?.id ?? null,
      action: String(action).slice(0, 80),
      entity: entity ? String(entity).slice(0, 80) : null,
      entity_id: entityId ? String(entityId).slice(0, 80) : null,
      metadata: safeMeta,
    });
  } catch (err) {
    if (isStaleSessionError(err)) return;
    console.error("Activity log error");
  }
}
