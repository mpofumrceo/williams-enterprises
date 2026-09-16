"use client";

import { useMemo, useState } from "react";
import { submitContactForm } from "@/src/lib/actions/admin";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils/cn";

const TYPES = [
  { id: "general", label: "General Enquiry" },
  { id: "quote", label: "Request a Quote" },
  { id: "construction", label: "Construction Project" },
  { id: "development", label: "Property / Development" },
  { id: "partnership", label: "Partnership" },
  { id: "investment", label: "Investment" },
  { id: "other", label: "Other" },
] as const;

type EnquiryType = (typeof TYPES)[number]["id"];

function isQuoteLike(type: EnquiryType) {
  return type === "quote" || type === "construction" || type === "development";
}

export default function SmartContactForm({ initialType }: { initialType?: string }) {
  const starting = TYPES.some((t) => t.id === initialType) ? (initialType as EnquiryType) : "general";
  const [type, setType] = useState<EnquiryType>(starting);
  const [loading, setLoading] = useState(false);

  const source = useMemo(() => (type === "investment" ? "investor" : "contact"), [type]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("source", source);
    fd.set("enquiry_type", TYPES.find((t) => t.id === type)?.label ?? type);

    const extras = [
      ["enquiry_type", fd.get("enquiry_type")],
      ["project_type", fd.get("project_type")],
      ["project_location", fd.get("project_location")],
      ["project_size", fd.get("project_size")],
      ["budget_range", fd.get("budget_range")],
      ["timeline", fd.get("timeline")],
      ["investor_type", fd.get("investor_type")],
      ["area_of_interest", fd.get("area_of_interest")],
    ]
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([key, value]) => `${String(key).replace(/_/g, " ")}: ${String(value).trim()}`);

    const notes = String(fd.get("message") ?? "").trim();
    const composed = [...extras, notes ? `details: ${notes}` : ""].filter(Boolean).join("\n");
    fd.set("message", composed);

    const result = await submitContactForm(fd);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Message sent. Our team will get back to you.");
    form.reset();
    setType(starting);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-slate-700">What do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                type === item.id
                  ? "btn-skeuo bg-navy text-white"
                  : "border border-navy/10 bg-white text-navy hover:bg-stone"
              )}
              aria-pressed={type === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <input type="hidden" name="source" value={source} />
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="full_name" name="full_name" label="Full name" required placeholder="Your full name" />
        <Input id="email" name="email" type="email" label="Email" required placeholder="your@email.com" />
      </div>
      <Input id="phone" name="phone" type="tel" label="Phone" placeholder="+263..." />

      {isQuoteLike(type) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="project_type" name="project_type" label="Project type" placeholder="Residential, commercial..." />
          <Input id="project_location" name="project_location" label="Project location" placeholder="City / suburb" />
          <Input id="project_size" name="project_size" label="Estimated size" placeholder="e.g. 400m² or 12 units" />
          <Input id="budget_range" name="budget_range" label="Budget range" placeholder="Optional" />
          <Input id="timeline" name="timeline" label="Timeline" placeholder="e.g. Q4 2026" className="sm:col-span-2" />
        </div>
      )}

      {type === "investment" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="investor_type" name="investor_type" label="Investor type" placeholder="Individual, family office, JV..." />
          <Input id="area_of_interest" name="area_of_interest" label="Area of interest" placeholder="Housing, commercial, infrastructure..." />
        </div>
      )}

      {type === "partnership" && (
        <Input id="area_of_interest" name="area_of_interest" label="Partnership focus" placeholder="What would you like to explore?" />
      )}

      <Textarea
        id="message"
        name="message"
        label={type === "investment" ? "Investment enquiry" : "Description"}
        required
        rows={5}
        placeholder={
          type === "investment"
            ? "Tell us how you would like to partner..."
            : "Share the details we should know..."
        }
      />

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Send enquiry
      </Button>
    </form>
  );
}
