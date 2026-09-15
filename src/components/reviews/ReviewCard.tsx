import Image from "next/image";
import { Star } from "lucide-react";
import type { Review } from "@/src/types/database";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="panel-skeuo rounded-3xl p-6">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className={i < review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
        ))}
      </div>
      <p className="mt-4 text-slate-700">&ldquo;{review.review_text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        {review.image_url && (
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image src={review.image_url} alt={review.name} fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-semibold text-navy">{review.name}</p>
          {review.company_name && <p className="text-sm text-slate-500">{review.company_name}</p>}
        </div>
      </div>
    </article>
  );
}
