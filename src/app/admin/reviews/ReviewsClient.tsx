"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Review } from "@/src/types/database";
import { updateReviewStatus, deleteReview } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { Star } from "lucide-react";

function ReviewActions({ review }: { review: Review }) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: string) {
    startTransition(async () => {
      const res = await updateReviewStatus(review.id, status);
      if (res.error) toast.error(res.error);
      else toast.success(`Review ${status}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {review.status !== "approved" && (
        <Button size="sm" loading={pending} onClick={() => setStatus("approved")}>Approve</Button>
      )}
      {review.status !== "hidden" && (
        <Button variant="outline" size="sm" loading={pending} onClick={() => setStatus("hidden")}>Hide</Button>
      )}
      {review.status !== "pending" && (
        <Button variant="ghost" size="sm" loading={pending} onClick={() => setStatus("pending")}>Reset</Button>
      )}
      <DeleteButton onDelete={() => deleteReview(review.id)} />
    </div>
  );
}

export default function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const pending = reviews.filter((r) => r.status === "pending");

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews before they appear on the site." />
      {pending.length > 0 && (
        <AdminCard className="mb-6 border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">{pending.length} review(s) pending approval</p>
        </AdminCard>
      )}
      <AdminCard title={`All Reviews (${reviews.length})`}>
        {reviews.length === 0 ? (
          <EmptyState title="No reviews yet" />
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy">{r.name}</h4>
                      <StatusBadge status={r.status} />
                      <span className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    </div>
                    {r.company_name && <p className="text-xs text-slate-500">{r.company_name}</p>}
                    <p className="mt-2 text-sm text-slate-700">{r.review_text}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <ReviewActions review={r} />
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
