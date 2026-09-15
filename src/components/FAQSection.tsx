"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/src/types/database";
import { AnimatedSection } from "@/src/components/animations/AnimatedSection";

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="panel-skeuo overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <h3 className="text-lg font-bold text-navy">{faq.question}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-amber-600 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="border-t border-slate-100 px-6 pb-5 pt-3 text-gray-600">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;

  return (
    <AnimatedSection className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="font-semibold text-amber-600">FAQs</span>
          <h2 className="mt-4 text-4xl font-bold text-navy md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Answers to common questions about Williams Enterprises and our construction services.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
