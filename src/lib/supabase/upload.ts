"use client";

import { createClient } from "@/src/lib/supabase/client";
import { isVideoUrl } from "@/src/lib/utils/media";

export { isVideoUrl };

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 80;
const MAX_DOC_MB = 15;

export type MediaKind = "image" | "video" | "media" | "document";

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

export function validateMediaFile(file: File, kind: MediaKind): string | null {
  if (kind === "image" && !isImage(file)) return "Please select an image file.";
  if (kind === "video" && !isVideo(file)) return "Please select a video file.";
  if (kind === "media" && !isImage(file) && !isVideo(file)) {
    return "Please select an image or video file.";
  }
  if (kind === "document") {
    const ok =
      isImage(file) ||
      file.type === "application/pdf" ||
      file.type.startsWith("application/");
    if (!ok) return "Please select an image, PDF, or document.";
  }

  const sizeMb = file.size / (1024 * 1024);
  if (isVideo(file) && sizeMb > MAX_VIDEO_MB) return `Video must be under ${MAX_VIDEO_MB}MB.`;
  if (isImage(file) && sizeMb > MAX_IMAGE_MB) return `Image must be under ${MAX_IMAGE_MB}MB.`;
  if (!isImage(file) && !isVideo(file) && sizeMb > MAX_DOC_MB) {
    return `File must be under ${MAX_DOC_MB}MB.`;
  }
  return null;
}

export async function uploadToStorage(
  bucket: string,
  folder: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const filePath = `${folder}/${Date.now()}-${safeName}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: true,
      contentType: file.type || undefined,
    });

    if (error) return { url: null, error: error.message };

    const privateBuckets = ["employees", "receipts", "quotations"];
    if (privateBuckets.includes(bucket)) {
      const { data: signed, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 2);
      if (signError || !signed?.signedUrl) {
        return { url: null, error: signError?.message || "Could not create file link" };
      }
      return { url: signed.signedUrl, error: null };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}
