"use client";

import { useState } from "react";
import { submitContactForm } from "@/src/lib/actions/admin";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

export default function ContactForm({
  source = "contact",
  messagePlaceholder = "Tell us about your project...",
  submitLabel = "Send Message",
}: {
  source?: "contact" | "investor";
  messagePlaceholder?: string;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await submitContactForm(fd);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Message sent successfully! We'll get back to you soon.");
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="source" value={source} />
      <Input id="full_name" name="full_name" label="Full Name" required placeholder="Your full name" />
      <Input id="email" name="email" type="email" label="Email Address" required placeholder="your@email.com" />
      <Input id="phone" name="phone" type="tel" label="Phone Number" placeholder="+263..." />
      <Textarea
        id="message"
        name="message"
        label="Your Message"
        required
        rows={5}
        placeholder={messagePlaceholder}
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
