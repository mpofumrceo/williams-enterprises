import Link from "next/link";
import HeroBackground from "@/src/components/hero/HeroBackground";
import {
  FadeIn,
  RevealUp,
  ScaleIn,
  SlideIn,
  StaggerChildren,
  StaggerItem,
} from "@/src/components/animations/AnimatedSection";
import ProjectCard from "@/src/components/projects/ProjectCard";
import { getHeroBackground, getProjects, getAboutContent } from "@/src/lib/data/public";

export const revalidate = 60;

export const metadata = {
  title: "Projects",
  description:
    "Explore Williams Enterprises completed and ongoing construction projects across residential, commercial, and industrial sectors.",
};

const defaultStats = [
  { value: "50+", label: "Completed Projects" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "10+", label: "Years Experience" },
  { value: "16+", label: "Construction Services" },
];

export default async function ProjectsPage() {
  const [hero, allProjects, about] = await Promise.all([
    getHeroBackground("projects"),
    getProjects(),
    getAboutContent(),
  ]);

  const featured = allProjects.filter((p) => p.is_featured);
  const recent = allProjects.filter((p) => p.is_recent);
  const trending = allProjects.filter((p) => p.is_trending);

  const stats = about?.stats?.length ? about.stats : defaultStats;
  const featuredFour = featured.slice(0, 4);
  const trendingFour = trending.slice(0, 4);
  const recentList = recent.length ? recent : [];
  const catalog = allProjects.length ? allProjects : [...featured, ...recent, ...trending];

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-[55vh]">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center px-6 py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="font-semibold text-amber-400">OUR PROJECTS</span>
            <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">
              Construction Projects
            </h1>
            <p className="mt-6 text-xl text-slate-200">
              Explore our completed and ongoing projects demonstrating our commitment to quality
              and excellence.
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
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                Featured
              </span>
              <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">Featured projects</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Signature builds that show the standard of Williams Enterprises workmanship.
              </p>
            </RevealUp>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredFour.map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} tone="light" />
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
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
                Trending
              </span>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Trending projects</h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Projects drawing the most attention right now.
              </p>
            </SlideIn>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trendingFour.map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} tone="dark" />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {recentList.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScaleIn>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                Recent
              </span>
              <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">Recent projects</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Fresh work from our latest sites and deliveries.
              </p>
            </ScaleIn>
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentList.slice(0, 8).map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} tone="light" />
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
              Portfolio
            </span>
            <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">All projects</h2>
          </FadeIn>
          {catalog.length > 0 ? (
            <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} tone="light" />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <p className="mt-10 text-slate-500">Projects will appear here once published.</p>
          )}
        </div>
      </section>

      <section className="bg-navy py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center">
                  <h3 className="text-4xl font-bold text-amber-400 md:text-5xl">{stat.value}</h3>
                  <p className="mt-2 text-slate-300">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Let&apos;s build your next project
            </h2>
            <p className="mt-6 text-xl text-slate-300">
              Contact Williams Enterprises today for a free consultation.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-block rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white transition hover:bg-amber-700"
            >
              Request a quote
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
