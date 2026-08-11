import Link from "next/link";
import Image from "next/image";
import HeroBackground from "@/src/components/hero/HeroBackground";
import { AnimatedSection, FadeIn } from "@/src/components/animations/AnimatedSection";
import { getHeroBackground, getGalleryItems } from "@/src/lib/data/public";

export const metadata = {
  title: "Gallery",
  description:
    "Browse the Williams Enterprises construction portfolio — completed projects, milestones, and quality workmanship.",
};

export default async function GalleryPage() {
  const [hero, items] = await Promise.all([
    getHeroBackground("gallery"),
    getGalleryItems(),
  ]);

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-[55vh]">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center px-6 py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="font-semibold text-amber-400">PROJECT GALLERY</span>
            <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">
              Our Construction Portfolio
            </h1>
            <p className="mt-6 text-xl text-slate-200">
              A showcase of our completed projects, construction milestones, and quality
              workmanship.
            </p>
          </FadeIn>
        </div>
      </HeroBackground>

      {categories.length > 0 && (
        <AnimatedSection className="border-b bg-slate-50 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-navy/20 bg-white px-5 py-2 text-sm font-medium text-navy"
                >
                  {cat}
                </span>
              ))}
            </FadeIn>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {items.length > 0 ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {items.map((item, i) => (
                <FadeIn key={item.id} delay={(i % 8) * 0.05} className="mb-6 break-inside-avoid">
                  <div className="group overflow-hidden rounded-3xl shadow-xl">
                    <div className="relative">
                      <Image
                        src={item.image_url}
                        alt={item.title ?? "Gallery image"}
                        width={800}
                        height={600}
                        className="w-full transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      {(item.title || item.description) && (
                        <div className="absolute inset-x-0 bottom-0 translate-y-full p-5 transition group-hover:translate-y-0">
                          {item.title && (
                            <h3 className="font-bold text-white">{item.title}</h3>
                          )}
                          {item.description && (
                            <p className="mt-1 text-sm text-slate-200">{item.description}</p>
                          )}
                          {item.category && (
                            <span className="mt-2 inline-block text-xs font-semibold text-amber-400">
                              {item.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn className="py-16 text-center text-gray-500">
              <p>Gallery images coming soon.</p>
            </FadeIn>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-navy py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="text-center">
            <span className="font-semibold text-amber-400">CRAFTSMANSHIP</span>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Every Detail Matters
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              From foundation to finish, our gallery reflects the precision and pride we bring
              to every Williams Enterprises project.
            </p>
          </FadeIn>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold text-white md:text-5xl">Ready To Start Building?</h2>
            <p className="mt-6 text-xl text-slate-300">
              Let&apos;s transform your vision into reality.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-block rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white transition hover:bg-amber-700"
            >
              Contact Us Today
            </Link>
          </FadeIn>
        </div>
      </AnimatedSection>
    </main>
  );
}
