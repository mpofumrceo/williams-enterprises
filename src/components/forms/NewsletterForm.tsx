"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/src/lib/actions/admin";
import { toast } from "sonner";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("name", name);
    const result = await subscribeNewsletter(fd);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Successfully subscribed!");
      setEmail("");
      setName("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-orange-100 focus:outline-none focus:ring-2 focus:ring-white/30"
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-orange-100 focus:outline-none focus:ring-2 focus:ring-white/30"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
