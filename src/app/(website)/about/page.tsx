import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  HardHat,
  Trophy,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import HeroBackground from "@/src/components/hero/HeroBackground";
import { AnimatedSection, FadeIn, StaggerChildren, StaggerItem } from "@/src/components/animations/AnimatedSection";
import ServiceCard from "@/src/components/services/ServiceCard";
import ProjectCard from "@/src/components/projects/ProjectCard";
import {
  getAboutContent,
  getFounders,
  getHeroBackground,
  getServices,
  getProjects,
} from "@/src/lib/data/public";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Williams Enterprises — our story, mission, vision, and the team building Zimbabwe's future.",
};

const defaultValues = [
  "Integrity & Transparency",
  "Safety First",
  "Customer Satisfaction",
  "Quality Workmanship",
  "Innovation",
  "Professional Excellence",
];

export default async function AboutPage() {
  const [hero, about, founders, featuredServices, recentProjects] = await Promise.all([
    getHeroBackground("about"),
    getAboutContent(),
    getFounders(),
    getServices({ featured: true }),
    getProjects({ recent: true }),
  ]);

  const values = about?.values?.length ? about.values : defaultValues;
  const servicesFour = (featuredServices.length ? featuredServices : await getServices()).slice(0, 4);
  const projectsFour = (recentProjects.length ? recentProjects : await getProjects()).slice(0, 4);

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-[55vh]">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center px-6 py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="font-semibold text-amber-400">ABOUT US</span>
            <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">
              {about?.title ?? "About Williams Enterprises"}
            </h1>
            <p className="mt-6 text-xl text-slate-200">
              Building Today, Transforming Tomorrow through quality construction,
              innovation, and excellence.
            </p>
          </FadeIn>
        </div>
      </HeroBackground>

      <AnimatedSection className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <span className="font-semibold text-amber-600">WHO WE ARE</span>
              <h2 className="mt-4 text-4xl font-bold text-navy">
                Building Strong Structures That Last Generations
              </h2>
              <p className="mt-6 text-lg text-gray-600">
                {about?.main_description ??
                  "Williams Enterprises is a trusted construction company dedicated to delivering high-quality building solutions across residential, commercial, and industrial sectors."}
              </p>
              {about?.company_story && (
                <p className="mt-4 text-lg text-gray-600">{about.company_story}</p>
              )}
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-slate-100 p-10">
                <h3 className="mb-8 text-2xl font-bold text-navy">Our Core Values</h3>
                <div className="space-y-5">
                  {values.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="shrink-0 text-amber-600" size={20} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </AnimatedSection>

      {founders.length > 0 && (
        <AnimatedSection className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <span className="font-semibold text-amber-600">LEADERSHIP</span>
              <h2 className="mt-4 text-4xl font-bold text-navy">Meet Our Founders</h2>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {founders.map((founder, i) => (
                <FadeIn key={founder.id} delay={i * 0.1}>
                  <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:shadow-xl">
                    <div className="relative h-72 bg-navy">
                      {founder.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={founder.image_url}
                          alt={founder.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl font-bold text-amber-400">
                          {founder.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-navy">{founder.name}</h3>
                      {founder.title && (
                        <p className="mt-1 font-medium text-amber-600">{founder.title}</p>
                      )}
                      {founder.biography && (
                        <p className="mt-4 text-gray-600">{founder.biography}</p>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {about?.stats && about.stats.length > 0 && (
        <AnimatedSection className="bg-navy py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <span className="font-semibold text-amber-400">BY THE NUMBERS</span>
              <h2 className="mt-3 text-3xl font-bold text-white">Our Impact</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.stats.map((stat, i) => (
                <FadeIn key={`${stat.label}-${i}`} delay={i * 0.08}>
                  <div className="rounded-3xl glass p-8 text-center">
                    <h3 className="text-5xl font-bold text-amber-400">{stat.value}</h3>
                    <p className="mt-2 text-slate-300">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {servicesFour.length > 0 && (
        <AnimatedSection className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-semibold text-amber-600">WHAT WE DO</span>
                <h2 className="mt-2 text-3xl font-bold text-navy">Our Services</h2>
              </div>
              <Link href="/services" className="font-semibold text-amber-600 hover:text-amber-700">
                View all →
              </Link>
            </div>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {servicesFour.map((s) => (
                <StaggerItem key={s.id}>
                  <ServiceCard service={s} hoverReveal />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </AnimatedSection>
      )}

      {projectsFour.length > 0 && (
        <AnimatedSection className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-semibold text-amber-600">OUR WORK</span>
                <h2 className="mt-2 text-3xl font-bold text-navy">Recent Projects</h2>
              </div>
              <Link href="/projects" className="font-semibold text-amber-600 hover:text-amber-700">
                View all →
              </Link>
            </div>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {projectsFour.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="bg-slate-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <FadeIn>
              <div className="rounded-3xl bg-white p-10 shadow-lg">
                <Building2 className="mb-6 h-12 w-12 text-amber-600" />
                <h3 className="text-3xl font-bold text-navy">Our Mission</h3>
                <p className="mt-4 text-gray-600">
                  {about?.mission ??
                    "To provide reliable, innovative, and affordable construction solutions that exceed client expectations while maintaining the highest standards of quality, safety, and professionalism."}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-white p-10 shadow-lg">
                <Trophy className="mb-6 h-12 w-12 text-amber-600" />
                <h3 className="text-3xl font-bold text-navy">Our Vision</h3>
                <p className="mt-4 text-gray-600">
                  {about?.vision ??
                    "To become one of Africa's most respected construction companies known for excellence, innovation, and transformative infrastructure development."}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="font-semibold text-amber-600">WHY CHOOSE US</span>
            <h2 className="mt-4 text-4xl font-bold text-navy">Our Competitive Advantage</h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: HardHat,
                title: "Experienced Team",
                text: "Skilled professionals committed to delivering exceptional construction results.",
              },
              {
                icon: ShieldCheck,
                title: "Guaranteed Quality",
                text: "We use premium materials and proven construction methods for long-lasting structures.",
              },
              {
                icon: Trophy,
                title: "Trusted Reputation",
                text: "We prioritize client satisfaction and timely project delivery.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="rounded-3xl border p-8 transition hover:border-amber-500 hover:shadow-lg">
                  <item.icon className="mb-5 h-12 w-12 text-amber-600" />
                  <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                  <p className="mt-4 text-gray-600">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white">
            {about?.cta_title ?? "Ready To Work With Us?"}
          </h2>
          <p className="mt-6 text-xl text-slate-300">
            {about?.cta_description ??
              "Let's discuss your next construction project and bring your vision to life."}
          </p>
          <Link
            href={about?.cta_button_url ?? "/contact"}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white transition hover:bg-amber-700"
          >
            {about?.cta_button_text ?? "Get In Touch"}
            <ArrowRight size={20} />
          </Link>
        </div>
      </AnimatedSection>
    </main>
  );
}
