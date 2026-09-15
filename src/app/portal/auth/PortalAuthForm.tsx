"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";

export default function PortalAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const reduce = useReducedMotion();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("email", email)
        .single();

      if (!profile || !["admin", "manager", "sales_manager", "staff"].includes(profile.role) || !profile.is_active) {
        await supabase.auth.signOut();
        setError("Access denied. Contact your administrator.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("Supabase is not configured")
          ? "Supabase is not configured. Add your keys to .env.local and restart npm run dev."
          : "Something went wrong. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040d18]">
      {/* Full-bleed construction atmosphere */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('/heroes/home.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#040d18]/95 via-[#0A2540]/85 to-[#071B2D]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,37,64,0.8),transparent_55%)]" />

      {/* Floating glass orbs */}
      {!reduce && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-orange-600/15 blur-3xl"
            animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </>
      )}

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-4 w-full max-w-md"
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-amber-400/40 via-white/10 to-orange-600/30 blur-[1px]" />

        <div className="relative overflow-hidden rounded-[27px] border border-white/20 bg-white/[0.07] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-10">
          {/* Inner highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="mb-10 flex flex-col items-center text-center">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/25 bg-white/10 p-2 shadow-lg backdrop-blur-md">
                <div className="relative h-full w-full">
                  <Image src="/logo.png" alt="Williams Enterprises" fill className="object-contain" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold tracking-tight text-white md:text-3xl"
            >
              Williams Enterprises
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-amber-300/90"
            >
              Building Today, Transforming Tomorrow
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              <Shield size={12} className="text-amber-400" />
              Secure enterprise access
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-amber-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 shadow-inner outline-none transition focus:border-amber-400/60 focus:bg-white/[0.14] focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-amber-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 shadow-inner outline-none transition focus:border-amber-400/60 focus:bg-white/[0.14] focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-amber-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200 backdrop-blur-sm"
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200 backdrop-blur-sm"
              >
                Access granted. Redirecting...
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(217,119,6,0.45)] transition disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition group-hover:opacity-100" />
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              ← Return to website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
