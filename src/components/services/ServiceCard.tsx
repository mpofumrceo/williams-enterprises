"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  PencilRuler,
  Calculator,
  Hammer,
  Home,
  Warehouse,
  House,
  PaintBucket,
  Grid3X3,
  Wrench,
  Zap,
  Drill,
  Cog,
  Brush,
  GlassWater,
  Map,
  type LucideIcon,
} from "lucide-react";
import { isVideoUrl, isOptimizableImageUrl } from "@/src/lib/utils/media";
import type { Service } from "@/src/types/database";
import { ScaleOnHover } from "@/src/components/animations/AnimatedSection";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
  /** Name-only until hover/focus reveals details */
  hoverReveal?: boolean;
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  Building2,
  PencilRuler,
  Calculator,
  Hammer,
  Home,
  Warehouse,
  House,
  PaintBucket,
  Grid3X3,
  Wrench,
  Zap,
  Drill,
  Cog,
  Brush,
  GlassWater,
  Map,
};

function ServiceIcon({
  service,
  size = 28,
  className = "text-amber-500",
}: {
  service: Service;
  size?: number;
  className?: string;
}) {
  const IconComponent = service.icon_name ? SERVICE_ICONS[service.icon_name] : null;

  if (IconComponent) return <IconComponent size={size} className={className} />;
  return <span className={`text-2xl font-bold ${className}`}>{service.name[0]}</span>;
}

function MediaFill({ url, alt }: { url: string; alt: string }) {
  if (isVideoUrl(url)) {
    return (
      <video
        key={url}
        src={url}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-focus-within:scale-105"
        muted
        loop
        playsInline
        preload="none"
        onMouseEnter={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
        }}
      />
    );
  }
  return (
    <Image
      key={url}
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 25vw"
      unoptimized={!isOptimizableImageUrl(url)}
      className="object-cover transition duration-700 group-hover:scale-105 group-focus-within:scale-105"
    />
  );
}

export default function ServiceCard({ service, compact, hoverReveal }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();

  if (hoverReveal) {
    return (
      <motion.article
        className="group relative h-56 overflow-hidden rounded-3xl outline-none frame-skeuo focus-within:ring-2 focus-within:ring-amber-500 md:h-64"
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        tabIndex={0}
      >
        {service.image_url ? (
          <div className="absolute inset-0">
            <MediaFill url={service.image_url} alt={service.name} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy to-[#163a5c]">
            <ServiceIcon service={service} size={48} className="text-amber-400" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 transition duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
          <h3 className="text-lg font-bold leading-snug text-white drop-shadow md:text-xl">
            {service.name}
          </h3>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300">
            Hover for details
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-white/95 p-4 shadow-xl backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
          <h3 className="text-base font-bold text-navy">{service.name}</h3>
          {(service.short_description || service.description) && (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 line-clamp-3">
              {service.short_description || service.description}
            </p>
          )}
          {service.pricing_info && (
            <p className="mt-2 text-sm font-semibold text-amber-600">{service.pricing_info}</p>
          )}
          {service.category && (
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{service.category}</p>
          )}
          <Link
            href="/contact?type=quote"
            className="mt-3 inline-flex text-sm font-semibold text-amber-700"
          >
            Request a quote
          </Link>
        </div>
      </motion.article>
    );
  }

  if (compact) {
    return (
      <div className="panel-skeuo rounded-2xl p-4 transition hover:-translate-y-0.5">
        <h3 className="font-bold text-navy">{service.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{service.short_description}</p>
      </div>
    );
  }

  return (
    <ScaleOnHover>
      <div
        className="panel-skeuo group cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        {service.image_url ? (
          <div className="relative h-44 overflow-hidden bg-slate-100">
            <MediaFill url={service.image_url} alt={service.name} />
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center bg-navy text-white">
            <ServiceIcon service={service} size={40} className="text-amber-400" />
          </div>
        )}
        <div className="p-6">
          <h3 className="mb-2 text-xl font-bold text-navy">{service.name}</h3>
          <p className="text-gray-600">{service.short_description}</p>
          <div
            className={`overflow-hidden transition-all duration-300 ${expanded ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <p className="text-sm text-gray-500">{service.description}</p>
            {service.pricing_info && (
              <p className="mt-2 text-sm font-medium text-amber-600">{service.pricing_info}</p>
            )}
          </div>
          <p className="mt-3 text-xs text-amber-600 opacity-0 transition group-hover:opacity-100">
            {expanded ? "Click to collapse" : "Hover or click for details"}
          </p>
        </div>
      </div>
    </ScaleOnHover>
  );
}
