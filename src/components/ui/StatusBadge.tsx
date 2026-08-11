"use client";

import { cn } from "@/src/lib/utils/cn";

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    draft: "bg-slate-100 text-slate-700",
    pending: "bg-yellow-100 text-yellow-800",
    hidden: "bg-orange-100 text-orange-800",
    archived: "bg-slate-100 text-slate-500",
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", colors[status] || "bg-slate-100 text-slate-700")}>
      {status}
    </span>
  );
}
