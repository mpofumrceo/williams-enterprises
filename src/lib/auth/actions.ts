"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { isStaffRole } from "@/src/lib/permissions/roles";
import { consumeRateLimit, clientFingerprint, recordSecurityEvent } from "@/src/lib/security/rate-limit";
import { emailSchema } from "@/src/lib/security/validation";
import { safeInternalPath } from "@/src/lib/security/urls";
import { logActivity } from "@/src/lib/auth/session";

export async function loginAction(formData: FormData) {
  const parsedEmail = emailSchema.safeParse(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(String(formData.get("redirect") ?? "/admin"));

  if (!parsedEmail.success || password.length < 1 || password.length > 128) {
    return { error: "Invalid credentials. Please try again." };
  }

  const email = parsedEmail.data;
  const { ipHash } = await clientFingerprint();
  const limit = await consumeRateLimit("login", `${ipHash}:${email}`);
  if (limit.limited) {
    await recordSecurityEvent({ eventType: "FAILED_LOGIN", email, success: false, metadata: { reason: "rate_limited" } });
    return { error: "Too many requests. Try again later." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    await recordSecurityEvent({ eventType: "FAILED_LOGIN", email, success: false });
    return { error: "Invalid credentials. Please try again." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Invalid credentials. Please try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !isStaffRole(profile.role) || !profile.is_active) {
    await supabase.auth.signOut();
    await recordSecurityEvent({ eventType: "FAILED_LOGIN", email, success: false, metadata: { reason: "not_staff" } });
    return { error: "Access denied. Contact your administrator." };
  }

  try {
    await supabase.from("profiles").update({ last_sign_in_at: new Date().toISOString() }).eq("id", user.id);
  } catch {
    // Column is added by security_hardening.sql; login must still succeed without it.
  }
  await recordSecurityEvent({ eventType: "LOGIN", email, success: true });
  await logActivity("LOGIN", "auth", user.id);
  redirect(next);
}

export async function logoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logActivity("LOGOUT", "auth", user.id);
    await recordSecurityEvent({ eventType: "LOGOUT", email: user.email, success: true });
  }
  await supabase.auth.signOut();
  redirect("/portal/auth");
}
