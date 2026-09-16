"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon, Film, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  uploadToStorage,
  validateMediaFile,
  isVideoUrl,
  type MediaKind,
} from "@/src/lib/supabase/upload";
import { cn } from "@/src/lib/utils/cn";

interface MediaUploadProps {
  name: string;
  label?: string;
  bucket: string;
  folder?: string;
  defaultValue?: string | null;
  kind?: MediaKind;
  required?: boolean;
  className?: string;
  /** Allow selecting multiple files; calls onMultiUpload with all URLs */
  multiple?: boolean;
  onMultiUpload?: (urls: string[]) => void;
}

export default function MediaUpload({
  name,
  label = "Media",
  bucket,
  folder = "uploads",
  defaultValue = "",
  kind = "media",
  required = false,
  className,
  multiple = false,
  onMultiUpload,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [valueSnapshot, setValueSnapshot] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (defaultValue !== valueSnapshot) {
    setValueSnapshot(defaultValue);
    setUrl(defaultValue ?? "");
  }

  const accept =
    kind === "image"
      ? "image/*"
      : kind === "video"
        ? "video/*"
        : kind === "document"
          ? "image/*,.pdf,.doc,.docx"
          : "image/*,video/*";

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    if (multiple && onMultiUpload) {
      setUploading(true);
      setProgress(10);
      const urls: string[] = [];
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const err = validateMediaFile(file, kind);
        if (err) {
          toast.error(`${file.name}: ${err}`);
          continue;
        }
        const result = await uploadToStorage(bucket, folder, file);
        if (result.error || !result.url) {
          toast.error(result.error || `Failed to upload ${file.name}`);
          continue;
        }
        urls.push(result.url);
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      setUploading(false);
      setProgress(0);
      if (urls.length) {
        toast.success(`Uploaded ${urls.length} file${urls.length > 1 ? "s" : ""}`);
        onMultiUpload(urls);
      }
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const file = files[0];
    const err = validateMediaFile(file, kind);
    if (err) {
      toast.error(err);
      return;
    }

    setUploading(true);
    setProgress(30);
    const result = await uploadToStorage(bucket, folder, file);
    setProgress(100);
    setUploading(false);

    if (result.error || !result.url) {
      toast.error(result.error || "Upload failed");
      setProgress(0);
      return;
    }

    setUrl(result.url);
    toast.success("Upload complete");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function clear() {
    setUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const hint =
    kind === "image"
      ? "PNG, JPG, WEBP up to 10MB"
      : kind === "video"
        ? "MP4, WEBM up to 80MB"
        : kind === "document"
          ? "Images, PDF up to 15MB"
          : "Images or videos from your device";

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input type="hidden" name={name} value={url} required={required && !multiple} />

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {url && !multiple && (
          <div className="relative mb-3 overflow-hidden rounded-lg bg-slate-200">
            {isVideoUrl(url) ? (
              <video src={url} controls className="max-h-48 w-full object-contain" />
            ) : kind === "document" && !/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) ? (
              <div className="flex items-center gap-2 p-4 text-sm text-slate-600">
                <FileText size={18} />
                <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-amber-700 underline">
                  {url}
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Preview" className="max-h-48 w-full object-contain" />
            )}
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remove media"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : kind === "video" ? (
              <Film size={16} />
            ) : kind === "image" ? (
              <ImageIcon size={16} />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? "Uploading..." : multiple ? "Upload files" : "Upload from device"}
          </button>

          {!multiple && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Or paste a media URL"
              className="min-w-[200px] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500">{hint}</p>

        {uploading && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
