"use server";

import { createClient } from "@/src/lib/supabase/server";
import { isStaffRole } from "@/src/lib/permissions/roles";
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
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  } catch (error) {
    if (isStaleSessionError(error)) return null;
    throw error;
  }
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return data as Profile | null;
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
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("activity_logs").insert({
      user_id: session?.user?.id ?? null,
      action,
      entity: entity ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    if (isStaleSessionError(err)) return;
    console.error("Activity log error:", err);
  }
}
