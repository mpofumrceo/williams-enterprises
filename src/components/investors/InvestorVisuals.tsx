"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Project } from "@/src/types/database";
import { SkeuoCard } from "@/src/components/ui/surfaces";
import { isVideoUrl, isOptimizableImageUrl } from "@/src/lib/utils/media";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function PipelineChart({ projects }: { projects: Project[] }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      const key = project.category?.trim() || "Uncategorised";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [projects]);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Project categories will appear here as the portfolio grows.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} interval={0} angle={-18} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip />
          <Bar dataKey="count" fill="#0A2540" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OpportunityCards({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <SkeuoCard className="p-8 text-slate-600">
        Pipeline details are shared with qualified partners. Use the enquiry form to request investor information.
      </SkeuoCard>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => {
        const open = openId === project.id;
        return (
          <SkeuoCard key={project.id} className="overflow-hidden">
            {project.cover_image_url && (
              <div className="relative h-48 bg-navy">
                {isVideoUrl(project.cover_image_url) ? (
                  <video src={project.cover_image_url} className="h-full w-full object-cover" muted playsInline preload="none" />
                ) : (
                  <Image
                    src={project.cover_image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={!isOptimizableImageUrl(project.cover_image_url)}
                    className="object-cover"
                  />
                )}
              </div>
            )}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                {project.category ?? "Development"}
              </p>
              <h3 className="mt-2 text-xl font-bold text-navy">{project.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                {project.location && <span className="rounded-full bg-stone px-3 py-1">{project.location}</span>}
                {project.project_status && <span className="rounded-full bg-stone px-3 py-1">{project.project_status}</span>}
              </div>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : project.id)}
                className="mt-5 text-sm font-semibold text-amber-700"
                aria-expanded={open}
              >
                {open ? "Close details" : "View opportunity"}
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {project.details || project.description || "Further commercial terms are shared privately after an enquiry."}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      Investment amounts are not published here. Request investor information to discuss structure.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SkeuoCard>
        );
      })}
    </div>
  );
}
