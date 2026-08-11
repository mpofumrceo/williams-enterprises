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
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Classic utility strip */}
      <div
        className={cn(
          "hidden border-b transition-colors duration-300 lg:block",
          scrolled
            ? "border-white/10 bg-navy-dark/95 text-slate-300"
            : "border-white/10 bg-navy-dark/80 text-slate-300 backdrop-blur-sm"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs tracking-wide">
          <p className="font-medium text-amber-400/90">Building Today, Transforming Tomorrow</p>
          <div className="flex items-center gap-5">
            <a
              href={telHref}
              className="inline-flex items-center gap-1.5 transition hover:text-amber-300"
            >
              <Phone size={12} />
              {phone}
            </a>
            <div className="flex items-center gap-2">
              {socialLinks.slice(0, 4).map((social) => {
                const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="rounded p-1 transition hover:bg-white/10 hover:text-amber-300"
                  >
                    <Icon size={12} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "border-white/10 bg-navy/95 shadow-[0_12px_40px_rgba(7,27,45,0.45)] backdrop-blur-xl"
            : "border-transparent bg-gradient-to-b from-navy/80 to-transparent backdrop-blur-[2px]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-6 md:py-3.5">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/15 transition group-hover:ring-amber-400/50 md:h-12 md:w-12">
              <Image
                src="/logo.png"
                alt="Williams Enterprises"
                fill
                priority
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-white md:text-lg">
                Williams Enterprises
              </p>
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-amber-400/90 sm:block">
                Construction · Zimbabwe
              </p>
            </div>
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Primary">
            <ul className="flex items-center gap-0.5">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group relative mx-0.5 inline-flex items-center px-3 py-2 text-[13px] font-medium tracking-wide transition",
                        active ? "text-amber-300" : "text-white/85 hover:text-white"
                      )}
                    >
                      {link.name}
                      <span
                        className={cn(
                          "absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-amber-400 transition-transform duration-300",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(217,119,6,0.35)] transition hover:bg-amber-500"
            >
              Get a Quote
              <ArrowUpRight
                size={16}
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white transition hover:border-amber-400/50 hover:bg-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[4.25rem] z-40 bg-navy/95 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto flex h-full max-w-7xl flex-col px-6 pb-10 pt-6"
              aria-label="Mobile"
            >
              <ul className="space-y-1">
                {links.map((link, i) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <motion.li
                      key={link.name}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between border-b border-white/10 py-4 text-lg font-medium transition",
                          active ? "text-amber-300" : "text-white hover:text-amber-200"
                        )}
                      >
                        {link.name}
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-4 pt-8">
                <a
                  href={telHref}
                  className="flex items-center justify-center gap-2 rounded-md border border-white/20 py-3 text-sm font-medium text-white"
                >
                  <Phone size={16} />
                  {phone}
                </a>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-md bg-amber-600 py-3.5 text-sm font-semibold text-white"
                >
                  Get a Quote
                  <ArrowUpRight size={16} />
                </Link>
                {socialLinks.length > 0 && (
                  <div className="flex justify-center gap-3 pt-2">
                    {socialLinks.map((social) => {
                      const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.platform}
                          className="rounded-md border border-white/15 p-2.5 text-white/80 transition hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Icon size={14} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
