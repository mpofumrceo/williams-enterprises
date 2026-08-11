"use client";

import { useRef, useState } from "react";
import { submitReview, uploadReviewImage } from "@/src/lib/actions/admin";
import { toast } from "sonner";
import { Star, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";

export default function ReviewForm({ onSuccess }: { onSuccess?: () => void }) {
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImagePick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadReviewImage(fd);
    setUploading(false);

    if (result.error || !("url" in result) || !result.url) {
      toast.error(result.error || "Upload failed");
      return;
    }

    setImageUrl(result.url);
    toast.success("Image uploaded");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("rating", rating.toString());
    fd.set("image_url", imageUrl);
    const result = await submitReview(fd);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Thank you! Your review has been submitted for approval.");
      e.currentTarget.reset();
      setRating(5);
      setImageUrl("");
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="name" name="name" label="Your Name" required />
      <Input id="company_name" name="company_name" label="Company Name (optional)" />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`Rate ${n} stars`}>
              <Star size={28} className={n <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
            </button>
          ))}
        </div>
      </div>
      <Textarea id="review_text" name="review_text" label="Your Review" required rows={4} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Project photo (optional)
        </label>
        <input type="hidden" name="image_url" value={imageUrl} />
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          {imageUrl && (
            <div className="relative mb-3 overflow-hidden rounded-lg bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Review preview" className="max-h-48 w-full object-contain" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading..." : "Upload from device"}
          </button>
          <p className="mt-2 text-xs text-slate-500">PNG, JPG, WEBP up to 10MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImagePick(e.target.files)}
          />
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Submit Review
      </Button>
    </form>
  );
}
