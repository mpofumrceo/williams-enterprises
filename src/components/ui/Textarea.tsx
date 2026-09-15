"use client";

import { cn } from "@/src/lib/utils/cn";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "input-skeuo w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
