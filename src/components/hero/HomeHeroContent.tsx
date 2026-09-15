"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassPanel } from "@/src/components/ui/surfaces";
import { telHref } from "@/src/lib/utils/contact";

export default function HomeHeroContent({
  stats,
  phone,
  eyebrow,
  heading,
  headingLine2,
  subheading,
  buttonText,
  buttonUrl,
  button2Text,
  button2Url,
  showPhone = true,
}: {
  stats?: { label: string; value: string }[];
  phone?: string | null;
  eyebrow?: string;
  heading?: string;
  headingLine2?: string;
  subheading?: string;
  buttonText?: string;
  buttonUrl?: string;
  button2Text?: string;
  button2Url?: string;
  showPhone?: boolean;
}) {
  const reduce = useReducedMotion();
  const tiles = (stats ?? []).slice(0, 3);
  const title = heading || "Building Today.";
  const line2 = headingLine2 || "Investing in Tomorrow.";

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl items-center px-6 py-28">
      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300"
          >
            {eyebrow || "Williams Enterprises"}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-extrabold leading-[1.05] text-white md:text-7xl"
          >
            {title}
            <span className="mt-2 block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              {line2}
            </span>
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 max-w-xl text-lg text-slate-200 md:text-xl"
          >
            {subheading ||
              "Construction, infrastructure and engineering in Zimbabwe — delivered with the discipline of a builder and the outlook of a long-term partner."}
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href={buttonUrl || "/contact"}
              className="btn-skeuo inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
              style={{ background: "var(--color-button)", color: "var(--color-button-text)" }}
            >
              {buttonText || "Request a Quote"} <ArrowRight size={16} />
            </Link>
            {(button2Text || button2Url) && (
              <Link
                href={button2Url || "/investors"}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md hover:bg-white/15"
              >
                {button2Text || "Explore Investment"}
              </Link>
            )}
            {showPhone && phone && (
              <a
                href={telHref(phone)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium text-white/85 hover:text-white"
              >
                <Phone size={16} /> {phone}
              </a>
            )}
          </motion.div>
        </div>

        {tiles.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {tiles.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 24, rotateX: 8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
              >
                <GlassPanel className="cms-surface px-5 py-5">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{stat.label}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
