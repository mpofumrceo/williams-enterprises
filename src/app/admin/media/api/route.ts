import { NextResponse } from "next/server";
import { getAdminMedia } from "@/src/lib/data/cms";
import { requireStaff } from "@/src/lib/auth/session";

export async function GET() {
  await requireStaff();
  const items = await getAdminMedia();
  return NextResponse.json({ items });
}
