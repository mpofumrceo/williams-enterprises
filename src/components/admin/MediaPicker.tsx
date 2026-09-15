"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImageIcon, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCmsMedia } from "@/src/lib/actions/cms";
import type { MediaLibraryItem } from "@/src/lib/cms/types";

export function MediaPicker({
  label,
  name,
  value,
  folder = "uploads",
  onChange,
}: {
  label: string;
  name: string;
  value?: string | null;
  folder?: string;
  onChange?: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(value ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCurrent(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    fetch("/admin/media/api", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]));
  }, [open]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const haystack = `${item.title ?? ""} ${item.category ?? ""} ${item.alt_text ?? ""}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [items, query]
  );

  function select(url: string) {
    setCurrent(url);
    onChange?.(url);
    setOpen(false);
  }

  function handleUpload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    fd.set("category", folder);
    startTransition(async () => {
      const result = await uploadCmsMedia(fd);
      if (result.error || !result.url) {
        toast.error(result.error ?? "Upload failed");
        return;
      }
      toast.success("Image uploaded");
      select(result.url);
    });
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input type="hidden" name={name} value={current} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/40"
        >
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-400" />
          )}
        </button>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn-clay rounded-xl px-3 py-2 text-sm">
            Select media
          </button>
          {current && (
            <button
              type="button"
              onClick={() => select("")}
              className="text-left text-xs text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="panel-clay max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/40 px-5 py-4">
              <h3 className="font-semibold text-navy">Media library</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, alt text, category"
                  className="input-clay w-full rounded-xl py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <label className="btn-clay inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm">
                <Upload className="h-4 w-4" />
                {pending ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
            </div>
            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto px-5 pb-5 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(item.url)}
                  className="overflow-hidden rounded-xl border border-white/60 bg-white/50 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.alt_text ?? ""} className="h-28 w-full object-cover" />
                  <p className="truncate px-2 py-1 text-xs text-slate-600">{item.title || "Untitled"}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-slate-500">No media yet. Upload an image.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
