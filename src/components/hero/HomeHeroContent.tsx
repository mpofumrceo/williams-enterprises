"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function HomeHeroContent() {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-32">
      <div className="max-w-3xl">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400"
        >
          Williams Enterprises
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-extrabold leading-[1.05] text-white md:text-7xl"
        >
          BUILDING TODAY,
          <motion.span
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-2 block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
          >
            TRANSFORMING TOMORROW
          </motion.span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 max-w-xl text-xl text-slate-200"
        >
          Williams Enterprises delivers professional construction, renovation, infrastructure and
          engineering solutions built to last generations.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <motion.div whileHover={reduce ? undefined : { scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/contact"
              className="inline-block rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white shadow-[0_12px_40px_rgba(217,119,6,0.4)] transition hover:bg-amber-700"
            >
              Get A Quote
            </Link>
          </motion.div>
          <motion.div whileHover={reduce ? undefined : { scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/services"
              className="inline-block rounded-xl border border-white/80 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Our Services
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
