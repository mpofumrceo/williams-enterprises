import Link from "next/link";
import { ArrowRight, TrendingUp, Newspaper, Clock } from "lucide-react";
import HeroBackground from "@/src/components/hero/HeroBackground";
import {
  FadeIn,
  RevealUp,
  ScaleIn,
  SlideIn,
  StaggerChildren,
  StaggerItem,
} from "@/src/components/animations/AnimatedSection";
import NewsCard from "@/src/components/news/NewsCard";
import { getHeroBackground, getNewsArticles } from "@/src/lib/data/public";

export const revalidate = 60;

export const metadata = {
  title: "News",
  description:
    "Stay updated with the latest news, insights, and announcements from Williams Enterprises.",
};

export default async function NewsPage() {
  const [hero, allArticles] = await Promise.all([
    getHeroBackground("news"),
    getNewsArticles(),
  ]);

  const featured = allArticles.filter((a) => a.is_featured);
  const trending = allArticles.filter((a) => a.is_trending);

  const featuredFour = featured.slice(0, 4);
  const trendingFour = trending.slice(0, 4);

  const featuredIds = new Set(featuredFour.map((a) => a.id));
  const trendingIds = new Set(trendingFour.map((a) => a.id));

  // "Recent" = newest articles not already in featured/trending
  const recentFour = allArticles
    .filter((a) => !featuredIds.has(a.id) && !trendingIds.has(a.id))
    .slice(0, 4);

  const catalog =
    allArticles.length > 0
      ? allArticles
      : [...featuredFour, ...trendingFour, ...recentFour];

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-[55vh]">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center px-6 py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="font-semibold text-amber-400">NEWS & INSIGHTS</span>
            <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">
              Latest from Williams Enterprises
            </h1>
            <p className="mt-6 text-xl text-slate-200">
              Industry updates, project highlights, and company news from our team.
            </p>
          </FadeIn>
        </div>
      </HeroBackground>

      {/* Space between hero and first section */}
      <div className="h-10 bg-white md:h-14" aria-hidden />

      {featuredFour.length > 0 && (
        <section className="bg-[#f3eee6] py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <RevealUp>
              <div className="flex items-center gap-2">
                <Newspaper size={18} className="text-amber-700" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Featured
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">Featured stories</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Top stories and announcements from Williams Enterprises.
              </p>
            </RevealUp>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredFour.map((article) => (
                <StaggerItem key={article.id}>
                  <NewsCard article={article} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {trendingFour.length > 0 && (
        <section className="bg-navy py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SlideIn from="left">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
                  Trending
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Trending articles</h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Popular reads our audience is engaging with right now.
              </p>
            </SlideIn>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trendingFour.map((article) => (
                <StaggerItem key={article.id}>
                  <div className="[&_a]:bg-white/95 [&_h3]:text-navy [&_p]:text-slate-600">
                    <NewsCard article={article} />
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {recentFour.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScaleIn>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                  Recent
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">Recent news</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Fresh updates from the Williams Enterprises team.
              </p>
            </ScaleIn>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentFour.map((article) => (
                <StaggerItem key={article.id}>
                  <NewsCard article={article} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
              Archive
            </span>
            <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">All articles</h2>
          </FadeIn>
          {catalog.length > 0 ? (
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((article) => (
                <StaggerItem key={article.id}>
                  <NewsCard article={article} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <FadeIn className="mt-10 py-16 text-center text-gray-500">
              <p>No articles published yet. Check back soon.</p>
            </FadeIn>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold text-white">Have a project in mind?</h2>
            <p className="mt-6 text-xl text-slate-300">
              Get in touch with our team for a consultation.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white transition hover:bg-amber-700"
            >
              Contact us <ArrowRight size={20} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
