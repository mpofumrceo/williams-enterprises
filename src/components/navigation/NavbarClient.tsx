"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
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

const defaultLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Investors", href: "/investors" },
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
  socialLinks: SocialLink[];
  links?: { name: string; href: string; newTab?: boolean }[];
  companyName?: string;
  tagline?: string | null;
  logoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavbarClient({
  socialLinks,
  links = defaultLinks,
  companyName = "Williams Enterprises",
  tagline = "Construction",
  logoUrl = "/logo.png",
  ctaText = "Get a Quote",
  ctaUrl = "/contact",
}: NavbarClientProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          "nav-clay pointer-events-auto mx-auto max-w-7xl overflow-hidden transition-shadow duration-300",
          open && "max-h-[calc(100dvh-1.5rem)] overflow-y-auto",
          scrolled || open ? "nav-clay-scrolled" : ""
        )}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 md:px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <span className="nav-clay-icon relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl md:h-11 md:w-11">
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                priority
                sizes="44px"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-tight text-navy md:text-base">
                {companyName}
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-amber-700 sm:block">
                {tagline || "Construction"}
              </span>
            </span>
          </Link>

          <nav className="hidden lg:block" aria-label="Primary">
            <ul className="nav-clay-track flex items-center gap-0.5 rounded-full p-1">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.name} className="relative">
                    {active && !reduce && (
                      <motion.span
                        layoutId="nav-pill"
                        className="nav-clay-pill absolute inset-0 rounded-full"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                      <Link
                        href={link.href}
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.newTab ? "noopener noreferrer" : undefined}
                        aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 inline-flex items-center rounded-full px-2.5 py-1.5 text-[12px] font-medium transition xl:px-3 xl:text-[13px]",
                        active
                          ? reduce
                            ? "nav-clay-pill text-navy"
                            : "text-navy"
                          : "text-navy/65 hover:text-navy"
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
            {socialLinks.slice(0, 4).map((social) => {
              const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="nav-clay-icon inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:brightness-105"
                >
                  <Icon size={14} />
                </a>
              );
            })}
            <Link
              href={ctaUrl}
              className="nav-clay-cta group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
            >
              {ctaText}
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
            className="nav-clay-icon inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
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
              className="border-t border-white/60 lg:hidden"
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
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.newTab ? "noopener noreferrer" : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-3 py-3 text-base font-medium transition",
                          active
                            ? "nav-clay-pill text-navy"
                            : "text-navy/80 hover:bg-white/50"
                        )}
                      >
                        {link.name}
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="space-y-2 border-t border-white/60 px-3 py-3">
                <Link
                  href={ctaUrl}
                  onClick={() => setOpen(false)}
                  className="nav-clay-cta flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
                >
                  {ctaText}
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
                          className="nav-clay-icon rounded-full p-2.5"
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

