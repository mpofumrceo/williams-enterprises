const IMAGE_SIGNS: Array<{ mime: string; ext: string; test: (bytes: Uint8Array) => boolean }> = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    mime: "image/gif",
    ext: "gif",
    test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
];

const PDF_SIGN = (b: Uint8Array) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;

const MP4_SIGN = (b: Uint8Array) =>
  b.length >= 12 &&
  b[4] === 0x66 &&
  b[5] === 0x74 &&
  b[6] === 0x79 &&
  b[7] === 0x70;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
export const MAX_DOC_BYTES = 15 * 1024 * 1024;

const BLOCKED_EXT = new Set([
  "svg",
  "html",
  "htm",
  "js",
  "mjs",
  "ts",
  "tsx",
  "php",
  "exe",
  "bat",
  "cmd",
  "sh",
  "ps1",
  "dll",
  "jar",
  "wasm",
  "xml",
]);

export type UploadKind = "image" | "video" | "media" | "document";

export async function inspectUpload(file: File, kind: UploadKind): Promise<
  { error: string; mime?: undefined; ext?: undefined } | { error: null; mime: string; ext: string }
> {
  const name = file.name || "upload";
  const ext = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
  if (!ext || BLOCKED_EXT.has(ext)) {
    return { error: "This file type is not allowed." };
  }
  if (ext === "svg") {
    return { error: "SVG uploads are disabled because they can contain scripts." };
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const image = IMAGE_SIGNS.find((item) => item.test(header));
  const isPdf = PDF_SIGN(header);
  const isMp4 = MP4_SIGN(header) || file.type === "video/mp4" || file.type === "video/webm";

  if (kind === "image") {
    if (!image) return { error: "Please upload a JPEG, PNG, WebP, or GIF image." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 10MB." };
    return { error: null, mime: image.mime, ext: image.ext };
  }

  if (kind === "video") {
    if (!isMp4) return { error: "Please upload an MP4 or WebM video." };
    if (file.size > MAX_VIDEO_BYTES) return { error: "Video must be under 80MB." };
    return { error: null, mime: file.type || "video/mp4", ext: ext === "webm" ? "webm" : "mp4" };
  }

  if (kind === "media") {
    if (image) {
      if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 10MB." };
      return { error: null, mime: image.mime, ext: image.ext };
    }
    if (isMp4) {
      if (file.size > MAX_VIDEO_BYTES) return { error: "Video must be under 80MB." };
      return { error: null, mime: file.type || "video/mp4", ext: ext === "webm" ? "webm" : "mp4" };
    }
    return { error: "Please upload an image or MP4/WebM video." };
  }

  if (image) {
    if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 10MB." };
    return { error: null, mime: image.mime, ext: image.ext };
  }
  if (isPdf) {
    if (file.size > MAX_DOC_BYTES) return { error: "PDF must be under 15MB." };
    return { error: null, mime: "application/pdf", ext: "pdf" };
  }
  return { error: "Please upload an image or PDF." };
}

export function safeStoragePath(folder: string, ext: string) {
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "uploads";
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "bin";
  return `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
}
