import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/src/types/database";
import { format } from "date-fns";

export default function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-xl">
      {article.featured_image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image src={article.featured_image_url} alt={article.title} fill className="object-cover transition group-hover:scale-105" />
        </div>
      )}
      <div className="p-6">
        {article.category && <span className="text-xs font-semibold text-amber-600">{article.category}</span>}
        <h3 className="mt-2 text-lg font-bold text-navy group-hover:text-amber-600">{article.title}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
        {article.published_at && (
          <p className="mt-4 text-xs text-gray-400">{format(new Date(article.published_at), "MMM d, yyyy")}</p>
        )}
      </div>
    </Link>
  );
}
