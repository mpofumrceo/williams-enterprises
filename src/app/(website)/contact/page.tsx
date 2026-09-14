import type { ComponentType } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";
import HeroBackground from "@/src/components/hero/HeroBackground";
import { AnimatedSection, FadeIn } from "@/src/components/animations/AnimatedSection";
import ContactForm from "@/src/components/forms/ContactForm";
import ContactMap from "@/src/components/forms/ContactMap";
import {
  getHeroBackground,
  getContactSettings,
  getSocialLinks,
} from "@/src/lib/data/public";

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitter: FaTwitter,
  x: FaTwitter,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Contact",
  description:
    "Contact Williams Enterprises for construction quotes, consultations, and project inquiries.",
};

function formatWhatsAppUrl(number: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default async function ContactPage() {
  const [hero, contact, socialLinks] = await Promise.all([
    getHeroBackground("contact"),
    getContactSettings(),
    getSocialLinks(),
  ]);

  const businessHours = contact?.business_hours
    ? contact.business_hours.split("\n").filter(Boolean)
    : ["Mon - Fri: 8AM - 5PM", "Saturday: 8AM - 1PM"];

  const hasMapCoords = contact?.map_lat != null && contact?.map_lng != null;

  return (
    <main className="bg-white text-slate-900">
      <HeroBackground hero={hero} minHeight="min-h-[50vh]">
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center px-6 py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <span className="font-semibold text-amber-400">CONTACT US</span>
            <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">Get In Touch</h1>
            <p className="mt-6 text-xl text-slate-200">
              {contact?.company_description ??
                "We would love to discuss your next construction project."}
            </p>
          </FadeIn>
        </div>
      </HeroBackground>

      {contact?.whatsapp && (
        <AnimatedSection className="relative z-20 -mt-8">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <a
                href={formatWhatsAppUrl(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-5 text-lg font-semibold text-white shadow-xl transition hover:bg-[#20bd5a] hover:shadow-2xl"
              >
                <FaWhatsapp size={28} />
                Chat With Us on WhatsApp
                <span className="hidden sm:inline">— {contact.whatsapp}</span>
              </a>
            </FadeIn>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-5">
            <FadeIn className="lg:col-span-3">
              <div className="rounded-3xl border bg-white p-8 shadow-xl md:p-10">
                <div className="mb-8 flex items-center gap-3">
                  <MessageCircle className="text-amber-600" size={28} />
                  <h2 className="text-3xl font-bold text-navy">Send Us A Message</h2>
                </div>
                <ContactForm />
              </div>
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-2">
              <div className="rounded-3xl bg-navy p-8 text-white md:p-10">
                <h2 className="mb-8 text-2xl font-bold">Contact Information</h2>
                <div className="space-y-8">
                  {contact?.phone && (
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20">
                        <Phone className="text-amber-400" size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold">Phone</h3>
                        <a
                          href={`tel:${contact.phone.replace(/\s/g, "")}`}
                          className="mt-1 block text-slate-300 transition hover:text-amber-400"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact?.email && (
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20">
                        <Mail className="text-amber-400" size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold">Email</h3>
                        <a
                          href={`mailto:${contact.email}`}
                          className="mt-1 block text-slate-300 transition hover:text-amber-400"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact?.address && (
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20">
                        <MapPin className="text-amber-400" size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold">Location</h3>
                        <p className="mt-1 text-slate-300">{contact.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20">
                      <Clock className="text-amber-400" size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold">Business Hours</h3>
                      {businessHours.map((line) => (
                        <p key={line} className="mt-1 text-slate-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="mt-10 border-t border-white/10 pt-8">
                    <h3 className="mb-4 font-bold">Follow Us</h3>
                    <div className="flex flex-wrap gap-3">
                      {socialLinks.map((social) => {
                        const Icon = iconMap[social.platform.toLowerCase()] ?? FaFacebookF;
                        return (
                          <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.platform}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition hover:bg-amber-600 hover:border-amber-600"
                          >
                            <Icon size={18} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </AnimatedSection>

      {hasMapCoords && (
        <AnimatedSection className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <span className="font-semibold text-amber-600">FIND US</span>
              <h2 className="mt-2 text-3xl font-bold text-navy">Our Location</h2>
            </FadeIn>
            <FadeIn delay={0.15} className="mt-8 overflow-hidden rounded-3xl shadow-xl">
              <ContactMap
                lat={contact!.map_lat!}
                lng={contact!.map_lng!}
                zoom={contact?.map_zoom ?? 14}
                label={contact?.address ?? "Williams Enterprises"}
              />
            </FadeIn>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="bg-gradient-to-r from-navy to-navy-dark py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold text-white">Prefer To Call?</h2>
            <p className="mt-4 text-xl text-slate-300">
              Our team is ready to answer your questions.
            </p>
            {contact?.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-amber-700"
              >
                <Phone size={22} />
                {contact.phone}
              </a>
            )}
            {!contact?.phone && (
              <Link
                href="/services"
                className="mt-8 inline-block rounded-xl bg-amber-600 px-8 py-4 font-semibold text-white transition hover:bg-amber-700"
              >
                Explore Our Services
              </Link>
            )}
          </FadeIn>
        </div>
      </AnimatedSection>
    </main>
  );
}
