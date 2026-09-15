"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame, Star, Layers } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { HeroBackground as HeroType, Service } from "@/src/types/database";
import HeroBackground from "@/src/components/hero/HeroBackground";
import ServiceCard from "@/src/components/services/ServiceCard";
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  RevealUp,
  StaggerChildren,
  StaggerItem,
  ScaleOnHover,
} from "@/src/components/animations/AnimatedSection";

const processSteps = [
  { title: "Consultation", detail: "We listen, assess, and scope your vision." },
  { title: "Planning", detail: "Design, costing, and clear project roadmaps." },
  { title: "Construction", detail: "Skilled delivery with safety and quality." },
  { title: "Handover", detail: "Finished work you can trust and enjoy." },
];

function FloatingOrbs({ reduce }: { reduce: boolean | null }) {
  if (reduce) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl"
        animate={{ y: [0, 28, 0], x: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
        animate={{ y: [0, -22, 0], x: [0, -16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className={light ? "text-amber-400" : "text-amber-600"} />}
        <span className={`text-sm font-semibold uppercase tracking-[0.18em] ${light ? "text-amber-400" : "text-amber-600"}`}>
          {eyebrow}
        </span>
      </div>
      <h2 className={`mt-3 text-3xl font-bold md:text-4xl ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base md:text-lg ${light ? "text-slate-300" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <StaggerChildren className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => (
        <StaggerItem key={service.id}>
          <ServiceCard service={service} hoverReveal />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

export default function ServicesPageContent({
  hero,
  trending,
  mostRequested,
  featured,
  allServices,
}: {
  hero: HeroType | null;
  trending: Service[];
  mostRequested: Service[];
  featured: Service[];
  allServices: Service[];
}) {
  const reduce = useReducedMotion();

  return (
    <main className="overflow-hidden bg-[#f7f4ef] text-slate-900">
      {/* 1) Hero entrance */}
      <HeroBackground hero={hero}>
        <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:justify-center md:pb-28">
          <FloatingOrbs reduce={reduce} />
          <RevealUp className="max-w-3xl">
            <motion.p
              className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400"
              initial={reduce ? false : { opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.28em" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Williams Enterprises
            </motion.p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-white md:text-7xl">
              Construction
              <span className="block text-amber-400">Services</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200 md:text-xl">
              From planning to handover — skilled teams, clear process, lasting results across Zimbabwe.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="btn-skeuo inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 font-semibold text-navy"
              >
                Get a free quote
                <ArrowRight size={18} />
              </Link>
              <a
                href="#trending"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:border-amber-400 hover:text-amber-300"
              >
                Explore services
              </a>
            </div>
          </RevealUp>

          {!reduce && (
            <motion.div
              className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-10 w-6 rounded-full border-2 border-white/40 p-1">
                <div className="h-2 w-full rounded-full bg-amber-400" />
              </div>
            </motion.div>
          )}
        </div>
      </HeroBackground>

      {/* 2) Trending — light section (contrast with navy hero) */}
      {trending.length > 0 && (
        <section id="trending" className="relative bg-[#f3eee6] py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(217,119,6,0.14),_transparent_50%)]" />
          <FloatingOrbs reduce={reduce} />
          <div className="relative mx-auto max-w-7xl px-6">
            <SlideIn from="left">
              <SectionHeading
                eyebrow="Trending now"
                title="Services in demand"
                description="What clients are asking for most right now — hover any tile for details."
                icon={Flame}
              />
            </SlideIn>
            <ServiceGrid services={trending} />
          </div>
        </section>
      )}

      {/* 3) Most requested — ScaleIn */}
      {mostRequested.length > 0 && (
        <section className="relative py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-6">
            <ScaleIn>
              <SectionHeading
                eyebrow="Most requested"
                title="Proven favourites"
                description="Trusted services our clients come back for again and again."
                icon={Sparkles}
              />
            </ScaleIn>
            <ServiceGrid services={mostRequested} />
          </div>
        </section>
      )}

      {/* 4) Featured — RevealUp */}
      {featured.length > 0 && (
        <section className="relative overflow-hidden bg-navy py-24">
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent"
            initial={reduce ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <RevealUp>
              <SectionHeading
                eyebrow="Featured"
                title="Standout capabilities"
                description="Signature offerings that define Williams Enterprises quality."
                light
                icon={Star}
              />
            </RevealUp>
            <ServiceGrid services={featured} />
          </div>
        </section>
      )}

      {/* 5) All services — Stagger + FadeIn */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionHeading
              eyebrow="Full catalog"
              title="All our services"
              description="Every discipline under one roof. Hover a service to learn more."
              icon={Layers}
            />
          </FadeIn>
          {allServices.length > 0 ? (
            <ServiceGrid services={allServices} />
          ) : (
            <p className="mt-10 text-slate-500">Services will appear here once published.</p>
          )}
        </div>
      </section>

      {/* 6) Process — ScaleOnHover steps + SlideIn */}
      <section className="relative overflow-hidden bg-navy py-24">
        <FloatingOrbs reduce={reduce} />
        <div className="relative mx-auto max-w-7xl px-6">
          <SlideIn from="right">
            <SectionHeading
              eyebrow="Our process"
              title="How we work"
              description="A clear path from first conversation to finished build."
              light
            />
          </SlideIn>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <ScaleOnHover key={step.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/10 p-7 backdrop-blur-sm">
                  <motion.span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-white"
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 260 }}
                  >
                    {index + 1}
                  </motion.span>
                  <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.detail}</p>
                </div>
              </ScaleOnHover>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <ScaleIn className="panel-skeuo-dark mx-auto max-w-4xl rounded-[2rem] px-6 py-16 text-center md:px-12">
          <h2 className="text-4xl font-bold text-white md:text-5xl">Ready to build with us?</h2>
          <p className="mt-5 text-lg text-slate-300">
            Tell us about your project — we&apos;ll respond with a clear next step.
          </p>
          <Link
            href="/contact?type=quote"
            className="btn-skeuo mt-10 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 font-semibold text-navy"
          >
            Get a free quote
            <ArrowRight size={20} />
          </Link>
        </ScaleIn>
      </section>
    </main>
  );
}
