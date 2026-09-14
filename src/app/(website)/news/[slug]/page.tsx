import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Metadata } from "next";
import { AnimatedSection, FadeIn } from "@/src/components/animations/AnimatedSection";
import NewsCard from "@/src/components/news/NewsCard";
import { getNewsBySlug, getNewsArticles } from "@/src/lib/data/public";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      images: article.featured_image_url ? [{ url: article.featured_image_url }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getNewsBySlug(slug),
    getNewsArticles({ limit: 4 }),
  ]);

  if (!article) notFound();

  const relatedArticles = related.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <main className="bg-white text-slate-900">
      {article.featured_image_url && (
        <AnimatedSection className="relative">
          <div className="relative h-[45vh] min-h-[320px]">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
          </div>
        </AnimatedSection>
      )}

      <article className="relative">
        <div className={`mx-auto max-w-4xl px-6 ${article.featured_image_url ? "-mt-32" : "pt-16"} pb-16`}>
          <FadeIn>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              <ArrowLeft size={16} /> Back to News
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className={`${article.featured_image_url ? "mt-8 rounded-3xl bg-white p-8 shadow-xl md:p-12" : "mt-8"}`}>
              {article.category && (
                <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
                  {article.category}
                </span>
              )}
              <h1 className="mt-4 text-4xl font-bold text-navy md:text-5xl">{article.title}</h1>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-500">
                {article.author && (
                  <span className="flex items-center gap-2">
                    <User size={16} className="text-amber-600" />
                    {article.author}
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-amber-600" />
                    {format(new Date(article.published_at), "MMMM d, yyyy")}
                  </span>
                )}
              </div>

              {article.excerpt && (
                <p className="mt-8 text-xl leading-relaxed text-gray-600">{article.excerpt}</p>
              )}

              {article.content && (
                <div className="prose prose-lg mt-10 max-w-none text-gray-700">
                  {article.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-8">
                  <Tag size={18} className="text-amber-600" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-navy/10 bg-slate-50 px-4 py-1 text-sm text-navy"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <AnimatedSection className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <span className="font-semibold text-amber-600">KEEP READING</span>
              <h2 className="mt-2 text-3xl font-bold text-navy">Related Articles</h2>
            </FadeIn>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {relatedArticles.map((a, i) => (
                <FadeIn key={a.id} delay={i * 0.08}>
                  <NewsCard article={a} />
                </FadeIn>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="bg-navy py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white">Ready To Start Your Project?</h2>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-xl bg-amber-600 px-8 py-3 font-semibold text-white transition hover:bg-amber-700"
            >
              Get In Touch
            </Link>
          </FadeIn>
        </div>
      </AnimatedSection>
    </main>
  );
}
