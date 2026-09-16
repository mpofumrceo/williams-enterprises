import { getProfile } from "@/src/lib/auth/session";
import { hasPermission, type Permission } from "@/src/lib/security/permissions";
import { isUuid } from "@/src/lib/security/validation";
import type { Profile } from "@/src/types/database";

export async function denyUnless(
  permission: Permission
): Promise<{ error: string; profile: null } | { error: null; profile: Profile }> {
  const profile = await getProfile();
  if (!profile || !profile.is_active || !hasPermission(profile, permission)) {
    return { error: "Unauthorized", profile: null };
  }
  return { error: null, profile };
}

export function denyUnlessId(id: string | null | undefined): { error?: string } {
  if (!id || !isUuid(id)) return { error: "Invalid request" };
  return {};
}
