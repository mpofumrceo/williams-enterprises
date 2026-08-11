"use client";

import type { Project } from "@/src/types/database";
import { ScaleOnHover } from "@/src/components/animations/AnimatedSection";
import { isVideoUrl } from "@/src/lib/utils/media";
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
      <div
        className={cn(
          "overflow-hidden rounded-2xl transition",
          light
            ? "border border-slate-200 bg-white shadow-md hover:border-amber-500/50 hover:shadow-lg"
            : "bg-white/10 backdrop-blur-sm hover:bg-white/15"
        )}
      >
        {project.cover_image_url && (
          <div className="relative h-52 overflow-hidden bg-slate-100">
            {isVideoUrl(project.cover_image_url) ? (
              <video
                src={project.cover_image_url}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="h-full w-full object-cover transition duration-500 hover:scale-110"
              />
            )}
          </div>
        )}
        <div className="p-5">
          <span
            className={cn(
              "text-xs font-semibold uppercase",
              light ? "text-amber-600" : "text-amber-400"
            )}
          >
            {project.category}
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
        </div>
      </div>
    </ScaleOnHover>
  );
}
