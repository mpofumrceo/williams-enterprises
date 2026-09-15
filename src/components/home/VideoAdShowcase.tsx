"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { HomeShowcaseItem, HomeShowcaseSettings, Service } from "@/src/types/database";
import { isVideoUrl } from "@/src/lib/utils/media";

const SLIDE_MS = 4500;

const FALLBACK_SHOTS = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
];

type Slide = {
  id: string;
  title: string;
  caption: string | null;
  media_url: string;
  media_type: "image" | "video";
};

const DEFAULT_SETTINGS: Pick<
  HomeShowcaseSettings,
  "is_enabled" | "eyebrow" | "heading" | "description" | "cta_label" | "cta_url"
> = {
  is_enabled: true,
  eyebrow: "Williams Enterprises",
  heading: "Everything we do",
  description:
    "A live look at the full range of construction work we deliver — from planning to finishing.",
  cta_label: "Explore services",
  cta_url: "/services",
};

export default function VideoAdShowcase({
  settings,
  items,
  services = [],
}: {
  settings: HomeShowcaseSettings | null;
  items: HomeShowcaseItem[];
  /** Fallback slides so the “what we do” reel always stays on the homepage */
  services?: Service[];
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const config = settings ?? DEFAULT_SETTINGS;

  const slides: Slide[] = useMemo(() => {
    if (items.length > 0) {
      return items.map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption,
        media_url: item.media_url,
        media_type: item.media_type === "video" || isVideoUrl(item.media_url) ? "video" : "image",
      }));
    }

    // Always keep the showcase of what we do using services
    return services.map((service, i) => {
      const media = service.image_url || FALLBACK_SHOTS[i % FALLBACK_SHOTS.length];
      return {
        id: service.id,
        title: service.name,
        caption: service.short_description,
        media_url: media,
        media_type: isVideoUrl(media) ? "video" : "image",
      };
    });
  }, [items, services]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduce, slides.length]);

  // Only hide if admin explicitly disabled it
  if (settings && !settings.is_enabled) return null;
  if (slides.length === 0) return null;

  const current = slides[index] ?? slides[0];
  const currentIsVideo = current.media_type === "video" || isVideoUrl(current.media_url);

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  return (
    <section className="relative bg-[#e8edf2]">
      <div className="h-6 bg-white md:h-8" aria-hidden />

      <div className="relative overflow-hidden px-4 py-10 md:px-6 md:py-14">
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy shadow-sm">
              <Film size={12} className="text-amber-600" />
              What we do
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              {config.eyebrow || DEFAULT_SETTINGS.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-navy md:text-3xl">
              {config.heading || DEFAULT_SETTINGS.heading}
            </h2>
            <p className="mt-3 max-w-md text-sm text-slate-600 md:text-base">
              {config.description || DEFAULT_SETTINGS.description}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.3 }}
                className="mt-5 border-l-4 border-amber-500 pl-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Now on screen
                </p>
                <p className="mt-0.5 text-lg font-bold text-navy md:text-xl">{current.title}</p>
                {current.caption && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{current.caption}</p>
                )}
              </motion.div>
            </AnimatePresence>

            <Link
              href={config.cta_url || "/services"}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark"
            >
              {config.cta_label || "Explore services"}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="overflow-hidden rounded-xl border-[4px] border-navy bg-navy shadow-lg">
              <div className="relative aspect-video overflow-hidden bg-navy-dark">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    className="absolute inset-0"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    {currentIsVideo ? (
                      <video
                        key={current.media_url}
                        src={current.media_url}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={current.media_url}
                        alt={current.title}
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy/80 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white drop-shadow">{current.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-amber-300">
                      {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      className="rounded-full bg-white/15 p-1.5 text-white backdrop-blur-sm transition hover:bg-white/25"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="rounded-full bg-white/15 p-1.5 text-white backdrop-blur-sm transition hover:bg-white/25"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto bg-navy-dark px-2 py-2">
                {slides.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative h-10 w-14 shrink-0 overflow-hidden rounded border-2 transition ${
                      i === index ? "border-amber-400" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Show ${item.title}`}
                  >
                    {item.media_type === "video" || isVideoUrl(item.media_url) ? (
                      <span className="flex h-full w-full items-center justify-center bg-navy-dark text-amber-400">
                        <Film size={14} />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.media_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
