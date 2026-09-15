"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/heroes/home.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[#0A2540]/85" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6">

        <div className="max-w-4xl">

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-full bg-amber-600/20 px-4 py-2 text-sm font-semibold text-amber-400"
          >
            Williams Enterprises
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-6xl font-black leading-tight text-white md:text-8xl"
          >
            BUILDING TODAY
            <span className="block text-amber-500">
              TRANSFORMING TOMORROW
            </span>
          </motion.h1>

          <p className="mt-8 max-w-2xl text-xl text-slate-300">
            Delivering world-class construction solutions,
            infrastructure development, renovations and
            engineering excellence.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white hover:bg-amber-700"
            >
              Get A Quote
              <ArrowRight size={18} />
            </Link>

            <a
              href="tel:+263712989340"
              className="flex items-center gap-2 rounded-xl border border-white px-8 py-4 font-semibold text-white"
            >
              <Phone size={18} />
              Call Us
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}