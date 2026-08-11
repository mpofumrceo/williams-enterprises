import { createClient } from "@/src/lib/supabase/server";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return <ReviewsClient reviews={reviews ?? []} />;
}
