import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Metadata } from "next";
import { AnimatedSection, FadeIn } from "@/src/components/animations/AnimatedSection";
import NewsCard from "@/src/components/news/NewsCard";
import HeroBackground from "@/src/components/hero/HeroBackground";
import { getNewsBySlug, getNewsArticles, getHeroBackground } from "@/src/lib/data/public";
import { format } from "date-fns";

export const revalidate = 60;

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
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || undefined,
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
  const [article, related, newsHero] = await Promise.all([
    getNewsBySlug(slug),
    getNewsArticles(4),
    getHeroBackground("news"),
  ]);

  if (!article) notFound();

  const relatedArticles = related.filter((a) => a.slug !== slug).slice(0, 3);
  const articleHero = {
    ...(newsHero ?? {
      id: "news-article",
      page_key: "news",
      background_type: "image" as const,
      background_url: null,
      mobile_background_url: null,
      overlay_color: "#0A2540",
      overlay_opacity: 0.6,
      is_active: true,
      created_at: "",
      updated_at: "",
    }),
    background_url: article.featured_image_url || newsHero?.background_url || null,
  };

  return (
    <main className="text-slate-900">
      <HeroBackground hero={articleHero}>
        <div className="mx-auto flex min-h-dvh max-w-4xl items-end px-6 pb-16 pt-32">
          <FadeIn>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              <ArrowLeft size={16} /> Back to News
            </Link>
            {article.category && (
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                {article.category}
              </p>
            )}
            <h1 className="mt-3 text-4xl font-bold text-white md:text-6xl">{article.title}</h1>
          </FadeIn>
        </div>
      </HeroBackground>

      <article className="relative">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <FadeIn>
            <div className="panel-skeuo rounded-3xl p-8 md:p-12">
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
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

      <AnimatedSection className="px-4 pb-16">
        <div className="panel-skeuo-dark mx-auto max-w-4xl rounded-[2rem] px-6 py-12 text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white">Ready To Start Your Project?</h2>
            <Link
              href="/contact"
              className="btn-skeuo mt-6 inline-block rounded-full bg-amber-500 px-8 py-3 font-semibold text-navy"
            >
              Get In Touch
            </Link>
          </FadeIn>
        </div>
      </AnimatedSection>
    </main>
  );
}
