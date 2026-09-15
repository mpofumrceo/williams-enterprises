"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ArrowUpRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";
import type { SocialLink } from "@/src/types/database";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/src/lib/utils/cn";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitter: FaTwitter,
  x: FaTwitter,
};

interface NavbarClientProps {
  phone: string;
  socialLinks: SocialLink[];
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavbarClient({ phone, socialLinks }: NavbarClientProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 p-3 md:p-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-7xl overflow-hidden rounded-2xl border shadow-lg transition-all duration-300",
          open && "max-h-[calc(100dvh-1.5rem)] overflow-y-auto",
          scrolled || open
            ? "border-white/10 bg-navy/80 shadow-[0_18px_50px_rgba(7,27,45,0.45)] backdrop-blur-2xl"
            : "border-white/15 bg-navy/35 shadow-[0_12px_40px_rgba(7,27,45,0.2)] backdrop-blur-xl"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 md:px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20 md:h-11 md:w-11">
              <Image
                src="/logo.png"
                alt="Williams Enterprises"
                fill
                priority
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-tight text-white md:text-base">
                Williams Enterprises
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-amber-300/90 sm:block">
                Construction
              </span>
            </span>
          </Link>

          <nav className="hidden lg:block" aria-label="Primary">
            <ul className="flex items-center gap-0.5 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.name} className="relative">
                    {active && !reduce && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium transition",
                        active
                          ? reduce
                            ? "bg-white text-navy"
                            : "text-navy"
                          : "text-white/75 hover:text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={telHref}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Phone size={14} />
              </span>
              <span className="hidden xl:inline">{phone}</span>
            </a>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-navy shadow-[0_8px_24px_rgba(245,158,11,0.35)] transition hover:bg-amber-400"
            >
              Get a Quote
              <ArrowUpRight
                size={15}
                className={cn(
                  "transition",
                  reduce ? "" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                )}
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-white/10 lg:hidden"
              aria-label="Mobile"
            >
              <ul className="space-y-1 px-3 py-3">
                {links.map((link, i) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <motion.li
                      key={link.name}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition",
                          active
                            ? "bg-white text-navy"
                            : "text-white/90 hover:bg-white/10"
                        )}
                      >
                        {link.name}
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="space-y-2 border-t border-white/10 px-3 py-3">
                <a
                  href={telHref}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-sm font-medium text-white"
                >
                  <Phone size={16} />
                  {phone}
                </a>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-navy"
                >
                  Get a Quote
                  <ArrowUpRight size={16} />
                </Link>
                {socialLinks.length > 0 && (
                  <div className="flex justify-center gap-2 pt-1 pb-1">
                    {socialLinks.map((social) => {
                      const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.platform}
                          className="rounded-full border border-white/10 p-2.5 text-white/70 transition hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Icon size={14} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
