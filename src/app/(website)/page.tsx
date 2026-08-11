import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Mail } from "lucide-react";
import HeroBackground from "@/src/components/hero/HeroBackground";
import HomeHeroContent from "@/src/components/hero/HomeHeroContent";
import VideoAdShowcase from "@/src/components/home/VideoAdShowcase";
import {
  AnimatedSection,
  FadeIn,
  SlideIn,
  ScaleIn,
  RevealUp,
  StaggerChildren,
  StaggerItem,
} from "@/src/components/animations/AnimatedSection";
import ServiceCard from "@/src/components/services/ServiceCard";
import ProjectCard from "@/src/components/projects/ProjectCard";
import NewsCard from "@/src/components/news/NewsCard";
import ReviewSection from "@/src/components/reviews/ReviewSection";
import FAQSection from "@/src/components/FAQSection";
import { isVideoUrl } from "@/src/lib/utils/media";
import {
  getHeroBackground,
  getServices,
  getProjects,
  getGalleryItems,
  getNewsArticles,
  getApprovedReviews,
  getFounders,
  getAboutContent,
  getContactSettings,
  getFaqs,
  getHomeShowcase,
} from "@/src/lib/data/public";

export default async function HomePage() {
  const [
    hero,
    allServices,
    featuredServices,
    recentProjects,
    galleryPreview,
    featuredNews,
    reviews,
    founders,
    about,
    contact,
    faqs,
    showcase,
  ] = await Promise.all([
    getHeroBackground("home"),
    getServices(),
    getServices({ featured: true }),
    getProjects({ recent: true }),
    getGalleryItems(),
    getNewsArticles({ featured: true, limit: 3 }),
    getApprovedReviews(),
    getFounders(),
    getAboutContent(),
    getContactSettings(),
    getFaqs(),
    getHomeShowcase(),
  ]);

  const featuredFour = featuredServices.slice(0, 4);
  const recentFour = recentProjects.slice(0, 4);
  const galleryFour = galleryPreview.filter((g) => !isVideoUrl(g.image_url)).slice(0, 4);

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-screen">
        <HomeHeroContent />
      </HeroBackground>

      <VideoAdShowcase
        settings={showcase.settings}
        items={showcase.items}
        services={allServices}
      />

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <SlideIn from="left">
            <span className="font-semibold text-amber-600">WHO WE ARE</span>
            <h2 className="mt-4 text-4xl font-bold text-navy">
              {about?.title ?? "About Williams Enterprises"}
            </h2>
            <p className="mt-6 text-lg text-gray-600">{about?.main_description}</p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-amber-600 hover:text-amber-700"
            >
              Learn More <ArrowRight size={18} />
            </Link>
          </SlideIn>
          {founders[0] && (
            <SlideIn from="right" delay={0.1}>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                <div className="relative h-72 bg-navy sm:h-80">
                  {founders[0].image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founders[0].image_url}
                      alt={founders[0].name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-bold text-amber-400">
                      {founders[0].name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-navy">{founders[0].name}</h3>
                  {founders[0].title && (
                    <p className="mt-1 font-medium text-amber-600">{founders[0].title}</p>
                  )}
                  {founders[0].biography && (
                    <p className="mt-4 line-clamp-4 text-gray-600">{founders[0].biography}</p>
                  )}
                </div>
              </div>
            </SlideIn>
          )}
        </div>
      </section>

      {about?.stats && about.stats.length > 0 && (
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn className="mb-10 text-center">
              <span className="font-semibold text-amber-400">BY THE NUMBERS</span>
              <h2 className="mt-2 text-3xl font-bold text-white">Williams Enterprises at a glance</h2>
            </FadeIn>
            <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.stats.map((stat, i) => (
                <StaggerItem key={`${stat.label}-${i}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center backdrop-blur-sm">
                    <p className="text-4xl font-bold text-amber-400 md:text-5xl">{stat.value}</p>
                    <p className="mt-2 text-slate-300">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {featuredFour.length > 0 && (
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <RevealUp>
              <h2 className="text-3xl font-bold text-navy">Featured Services</h2>
              <p className="mt-2 text-gray-600">Four signature solutions from our team</p>
            </RevealUp>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredFour.map((s) => (
                <StaggerItem key={s.id}>
                  <ServiceCard service={s} hoverReveal />
                </StaggerItem>
              ))}
            </StaggerChildren>
            <div className="mt-10 text-center">
              <Link href="/services" className="font-semibold text-amber-600 hover:text-amber-700">
                View all services →
              </Link>
            </div>
          </div>
        </section>
      )}

      {recentFour.length > 0 && (
        <section className="bg-navy py-24">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white">Recent Projects</h2>
              <p className="mt-2 text-slate-300">Latest construction work from our sites</p>
            </FadeIn>
            <StaggerChildren className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {recentFour.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </StaggerChildren>
            <div className="mt-10 text-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-3 font-semibold text-white hover:bg-amber-700"
              >
                View All Projects <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {galleryFour.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SlideIn from="left">
              <h2 className="text-3xl font-bold text-navy">From the Gallery</h2>
              <p className="mt-2 text-gray-600">A snapshot of quality on site</p>
            </SlideIn>
            <StaggerChildren className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryFour.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="group overflow-hidden rounded-2xl shadow-lg">
                    <Image
                      src={item.image_url}
                      alt={item.title ?? "Gallery"}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
            <div className="mt-8 text-center">
              <Link href="/gallery" className="font-semibold text-amber-600 hover:text-amber-700">
                View Full Gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {featuredNews.length > 0 && (
        <AnimatedSection className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold text-navy">Latest News</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {featuredNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      <ReviewSection reviews={reviews} />

      <FAQSection faqs={faqs} />

      <ScaleIn className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white">Ready To Start Your Project?</h2>
          <p className="mt-6 text-xl text-slate-300">
            Contact Williams Enterprises today for a consultation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-navy"
              >
                <Phone size={18} /> {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 rounded-xl border border-white px-6 py-3 font-semibold text-white"
              >
                <Mail size={18} /> {contact.email}
              </a>
            )}
          </div>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white hover:bg-amber-700"
          >
            Contact Us
          </Link>
        </div>
      </ScaleIn>
    </main>
  );
}
