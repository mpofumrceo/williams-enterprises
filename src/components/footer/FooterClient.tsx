"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";
import type { ContactSettings, SocialLink } from "@/src/types/database";
import type { FooterSettings } from "@/src/lib/cms/types";
import { parsePhones, telHref } from "@/src/lib/utils/contact";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

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

const defaultLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/investors", label: "Investors" },
  { href: "/contact", label: "Contact" },
];

interface FooterClientProps {
  contact: ContactSettings | null;
  socialLinks: SocialLink[];
  newsletter: ReactNode;
  footer?: FooterSettings | null;
  links?: { href: string; label: string }[];
  companyName?: string;
  tagline?: string | null;
}

export default function FooterClient({
  contact,
  socialLinks,
  newsletter,
  footer,
  links = defaultLinks,
  companyName = "Williams Enterprises",
  tagline = "Building Today, Transforming Tomorrow",
}: FooterClientProps) {
  const reduce = useReducedMotion();

  return (
    <footer className="relative overflow-hidden text-white" style={{ perspective: "1200px" }}>
      {/* Layered depth background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#d97706]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "rotateX(60deg) scale(1.5)",
          transformOrigin: "center top",
        }}
      />

      {/* Floating 3D blocks */}
      {!reduce && (
        <>
          <motion.div
            className="pointer-events-none absolute left-[8%] top-8 h-10 w-10 rounded-lg bg-white/15 shadow-[8px_8px_0_rgba(0,0,0,0.15)] backdrop-blur-sm"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ y: [0, -14, 0], rotateX: [12, 24, 12], rotateY: [10, -8, 10] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute right-[12%] top-16 h-8 w-8 rotate-12 rounded-md bg-amber-200/25 shadow-[6px_6px_0_rgba(0,0,0,0.12)]"
            animate={{ y: [0, 18, 0], rotateZ: [12, 28, 12] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-24 left-[40%] h-6 w-6 rounded-sm bg-white/20 shadow-[4px_4px_0_rgba(0,0,0,0.15)]"
            animate={{ y: [0, -10, 0], rotateY: [0, 35, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <motion.div
              whileHover={reduce ? undefined : { z: 20, rotateY: -4, rotateX: 2 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <motion.div
                  className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/30 bg-white/15 p-1 shadow-[4px_4px_0_rgba(0,0,0,0.15)]"
                  whileHover={reduce ? undefined : { rotateY: 18, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 260 }}
                >
                  <Image src={footer?.logo_url || "/logo.png"} alt={companyName} fill sizes="56px" className="object-contain" />
                </motion.div>
                <div>
                  <h2 className="text-base font-bold leading-tight">{companyName}</h2>
                  <p className="text-[11px] text-orange-100">{tagline}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-orange-50/95 line-clamp-4">
                {footer?.description ||
                  contact?.company_description ||
                  "Williams Enterprises delivers reliable construction and engineering solutions with excellence."}
              </p>
            </motion.div>

            {/* Links */}
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-100">
                {footer?.column_title || "Navigate"}
              </h3>
              <div className="flex flex-col gap-1.5 text-sm">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    whileHover={reduce ? undefined : { x: 6, z: 10 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0 }}
                  >
                    <Link
                      href={link.href}
                      className="inline-block text-white/90 transition hover:text-white"
                      style={{ transitionDelay: `${i * 20}ms` }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-100">Contact</h3>
              <div className="space-y-3 text-sm">
                {parsePhones(contact?.phone).map((phone) => (
                  <motion.a
                    key={phone}
                    href={telHref(phone)}
                    className="flex items-center gap-2"
                    whileHover={reduce ? undefined : { x: 4 }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-white/10 shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                      <Phone size={14} />
                    </span>
                    {phone}
                  </motion.a>
                ))}
                {contact?.email && (
                  <motion.a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2"
                    whileHover={reduce ? undefined : { x: 4 }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-white/10 shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                      <Mail size={14} />
                    </span>
                    <span className="truncate">{contact.email}</span>
                  </motion.a>
                )}
                {contact?.address && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-white/10 shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                      <MapPin size={14} />
                    </span>
                    {contact.address}
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {socialLinks.map((social) => {
                  const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
                  return (
                    <motion.a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 shadow-[3px_3px_0_rgba(0,0,0,0.15)]"
                      whileHover={
                        reduce
                          ? undefined
                          : { y: -4, rotateY: 15, scale: 1.08, backgroundColor: "rgba(255,255,255,0.95)", color: "#ea580c" }
                      }
                      transition={{ type: "spring", stiffness: 350 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Icon size={15} />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <motion.div
              whileHover={reduce ? undefined : { rotateY: 3, rotateX: -2 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {newsletter ? (
                <>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-100">Newsletter</h3>
                  <div className="rounded-2xl border border-white/20 bg-black/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    {newsletter}
                  </div>
                </>
              ) : footer?.cta_text && footer.cta_url ? (
                <>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-100">Next step</h3>
                  <Link
                    href={footer.cta_url}
                    className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-700"
                  >
                    {footer.cta_text}
                  </Link>
                </>
              ) : null}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-4 text-center md:flex-row md:text-left">
          <p className="text-xs text-orange-50/90">
            © {new Date().getFullYear()} {footer?.copyright || "Williams Enterprises. All Rights Reserved."}
          </p>
          <p className="text-xs font-medium text-white/90">{tagline}</p>
          <Link href="/portal/auth" aria-hidden="true" tabIndex={-1} className="group relative">
            <motion.div
              className="h-3.5 w-3.5 rotate-45 rounded-[3px] bg-gradient-to-br from-amber-300 to-orange-700 glow-orange shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
              animate={
                reduce
                  ? undefined
                  : { rotate: [45, 55, 45], scale: [1, 1.15, 1] }
              }
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.4 }}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
