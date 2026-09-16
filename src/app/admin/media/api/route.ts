import { NextResponse } from "next/server";
import { getAdminMedia } from "@/src/lib/data/cms";
import { getProfile } from "@/src/lib/auth/session";
import { hasPermission } from "@/src/lib/security/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  if (!profile || !hasPermission(profile, "media")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const items = await getAdminMedia();
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
