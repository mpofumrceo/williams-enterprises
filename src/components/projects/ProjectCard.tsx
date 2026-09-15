"use client";

import Image from "next/image";
import type { Project } from "@/src/types/database";
import { ScaleOnHover } from "@/src/components/animations/AnimatedSection";
import { isVideoUrl, isOptimizableImageUrl } from "@/src/lib/utils/media";
import { cn } from "@/src/lib/utils/cn";

export default function ProjectCard({
  project,
  tone = "dark",
}: {
  project: Project;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";

  return (
    <ScaleOnHover>
      <article
        className={cn(
          "overflow-hidden rounded-3xl transition",
          light
            ? "panel-skeuo hover:-translate-y-1"
            : "border border-white/10 bg-white/10 backdrop-blur-sm hover:bg-white/15"
        )}
      >
        {project.cover_image_url && (
          <div className={cn("relative h-52 overflow-hidden bg-slate-100", light && "frame-skeuo rounded-none")}>
            {isVideoUrl(project.cover_image_url) ? (
              <video
                src={project.cover_image_url}
                className="h-full w-full object-cover"
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
            ) : (
              <Image
                src={project.cover_image_url}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                unoptimized={!isOptimizableImageUrl(project.cover_image_url)}
                className="object-cover transition duration-500 hover:scale-105"
              />
            )}
          </div>
        )}
        <div className="p-5">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              light ? "text-amber-700" : "text-amber-400"
            )}
          >
            {project.category ?? "Project"}
          </span>
          <h3 className={cn("mt-2 text-xl font-bold", light ? "text-navy" : "text-white")}>
            {project.title}
          </h3>
          <p
            className={cn(
              "mt-2 line-clamp-2 text-sm",
              light ? "text-slate-600" : "text-slate-300"
            )}
          >
            {project.description}
          </p>
          {(project.location || project.project_status) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.location && (
                <span className={cn("rounded-full px-2.5 py-1 text-[11px]", light ? "bg-stone text-slate-600" : "bg-white/10 text-slate-200")}>
                  {project.location}
                </span>
              )}
              {project.project_status && (
                <span className={cn("rounded-full px-2.5 py-1 text-[11px]", light ? "bg-stone text-slate-600" : "bg-white/10 text-slate-200")}>
                  {project.project_status}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </ScaleOnHover>
  );
}
