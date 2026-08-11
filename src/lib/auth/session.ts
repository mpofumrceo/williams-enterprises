"use server";

import { createClient } from "@/src/lib/supabase/server";
import { isStaffRole } from "@/src/lib/permissions/roles";
import type { Profile } from "@/src/types/database";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !isStaffRole(profile.role) || !profile.is_active) {
    redirect("/portal/auth");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/portal/auth");
  }
  return profile;
}

export async function logActivity(
  action: string,
  entity?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("activity_logs").insert({
    user_id: user?.id ?? null,
    action,
    entity: entity ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ?? null,
  });
}
