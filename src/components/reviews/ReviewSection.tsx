"use client";

import { useState } from "react";
import type { Review } from "@/src/types/database";
import ReviewCard from "./ReviewCard";
import ReviewForm from "@/src/components/forms/ReviewForm";
import { AnimatedSection } from "@/src/components/animations/AnimatedSection";
import { Button } from "@/src/components/ui/Button";

export default function ReviewSection({ reviews }: { reviews: Review[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <AnimatedSection className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-navy">What Our Clients Say</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "Leave a Review"}
          </Button>
        </div>

        {showForm && (
          <div className="mt-8 max-w-lg rounded-2xl bg-slate-50 p-8">
            <ReviewForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-500">Be the first to leave a review!</p>
        )}
      </div>
    </AnimatedSection>
  );
}
