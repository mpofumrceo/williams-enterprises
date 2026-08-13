"use client";

import { uploadMediaAction } from "@/src/lib/actions/admin";
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
    const formData = new FormData();
    formData.set("file", file);
    formData.set("bucket", bucket);
    formData.set("folder", folder);
    return await uploadMediaAction(formData);
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}
