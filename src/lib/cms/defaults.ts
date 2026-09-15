import { DEFAULT_NAV } from "./constants";
import type { PageSection, SitePage } from "./types";

function section(
  pageId: string,
  type: string,
  sort: number,
  fields: Partial<PageSection>
): PageSection {
  return {
    id: `${pageId}-${type}-${sort}`,
    page_id: pageId,
    section_type: type,
    title: fields.title ?? null,
    subtitle: fields.subtitle ?? null,
    content: fields.content ?? null,
    image: null,
    video_url: null,
    settings: fields.settings ?? {},
    ui_style: fields.ui_style ?? null,
    background_type: "none",
    background_value: null,
    visible: true,
    status: "published",
    sort_order: sort,
    created_at: "",
    updated_at: "",
  };
}

function page(slug: string, title: string, seo: string, ui: SitePage["ui_style"], order: number): SitePage {
  return {
    id: `fallback-${slug}`,
    slug,
    title,
    description: seo,
    published: true,
    seo_title: title,
    seo_description: seo,
    og_image: `/heroes/${slug === "home" ? "home" : slug}.jpg`,
    ui_style: ui,
    sort_order: order,
    created_at: "",
    updated_at: "",
  };
}

export const FALLBACK_PAGES: SitePage[] = [
  page("home", "Home", "Construction, infrastructure and engineering in Zimbabwe.", "glassmorphism", 1),
  page("about", "About", "Learn about Williams Enterprises.", "skeuomorphism", 2),
  page("services", "Services", "Explore Williams Enterprises construction services.", "neumorphism", 3),
  page("projects", "Projects", "Explore completed and ongoing construction projects.", "skeuomorphism", 4),
  page("gallery", "Gallery", "Browse the construction portfolio.", "minimalism", 5),
  page("news", "News", "Latest news from Williams Enterprises.", "minimalism", 6),
  page("investors", "Investors", "Invest in Williams Enterprises.", "glassmorphism", 7),
  page("contact", "Contact", "Contact Williams Enterprises in Bulawayo.", "neumorphism", 8),
];

export const FALLBACK_SECTIONS: Record<string, PageSection[]> = {
  home: [
    section("fallback-home", "hero", 1, {
      title: "Building Today.",
      subtitle:
        "Construction, infrastructure and engineering in Zimbabwe — delivered with the discipline of a builder and the outlook of a long-term partner.",
      ui_style: "glassmorphism",
      settings: {
        eyebrow: "Williams Enterprises",
        heading_line_2: "Investing in Tomorrow.",
        button_text: "Request a Quote",
        button_url: "/contact",
        button2_text: "Explore Investment",
        button2_url: "/investors",
        show_stats: true,
        show_phone: true,
      },
    }),
    section("fallback-home", "showcase", 2, {}),
    section("fallback-home", "intro", 3, {
      title: "About Williams Enterprises",
      ui_style: "skeuomorphism",
      settings: { eyebrow: "Company", button_text: "Learn more", button_url: "/about", show_founder: true },
    }),
    section("fallback-home", "stats", 4, {
      title: "Williams Enterprises at a glance",
      ui_style: "neumorphism",
      settings: { eyebrow: "By the numbers", dark: true },
    }),
    section("fallback-home", "services", 5, {
      title: "Featured services",
      subtitle: "Signature capabilities from planning through finishing.",
      settings: { eyebrow: "Services", featured_only: true, limit: 4, button_text: "View all services →", button_url: "/services" },
    }),
    section("fallback-home", "projects", 6, {
      title: "Recent projects",
      subtitle: "Latest construction work from our sites.",
      ui_style: "glassmorphism",
      settings: { eyebrow: "Portfolio", recent_only: true, limit: 4, dark: true, button_text: "View all projects", button_url: "/projects" },
    }),
    section("fallback-home", "features", 7, {
      title: "Built for trust on site",
      subtitle: "The qualities clients and partners should expect from a construction operator.",
      settings: {
        eyebrow: "Why Williams Enterprises",
        items: [
          { title: "Experience", text: "Skilled teams delivering residential, commercial and infrastructure work." },
          { title: "Quality", text: "Materials, methods and supervision that stand up on site." },
          { title: "Delivery", text: "Clear programmes and accountable handover." },
          { title: "Partnership", text: "Clients and investors who want a reliable local operator." },
        ],
      },
    }),
    section("fallback-home", "investment", 8, {
      title: "A local builder with a long horizon",
      subtitle: "Joint ventures, project capital and partnerships for people who want to back real construction in Zimbabwe.",
      ui_style: "glassmorphism",
      settings: { eyebrow: "Investment", dark: true, button_text: "Explore Investment Opportunities", button_url: "/investors" },
    }),
    section("fallback-home", "gallery", 9, {
      title: "From the gallery",
      subtitle: "A snapshot of quality on site.",
      settings: { eyebrow: "Gallery", limit: 4, button_text: "View full gallery →", button_url: "/gallery" },
    }),
    section("fallback-home", "news", 10, { title: "Latest news", settings: { eyebrow: "News", featured_only: true, limit: 3 } }),
    section("fallback-home", "reviews", 11, {}),
    section("fallback-home", "faq", 12, {}),
    section("fallback-home", "cta", 13, {
      title: "Let's build something that matters.",
      subtitle: "Talk to Williams Enterprises about construction, development or partnership.",
      ui_style: "claymorphism",
      settings: {
        button_text: "Contact Us",
        button_url: "/contact",
        button2_text: "Request a Quote",
        button2_url: "/contact?type=quote",
        show_contact: true,
      },
    }),
  ],
  about: [
    section("fallback-about", "hero", 1, {
      title: "About Williams Enterprises",
      subtitle: "Building Today, Transforming Tomorrow through quality construction, innovation, and excellence.",
      settings: { eyebrow: "ABOUT US" },
    }),
    section("fallback-about", "intro", 2, {
      title: "Building Strong Structures That Last Generations",
      settings: { eyebrow: "WHO WE ARE", show_values: true },
    }),
    section("fallback-about", "leadership", 3, { title: "Meet Our Founders", settings: { eyebrow: "LEADERSHIP" } }),
    section("fallback-about", "stats", 4, { title: "Our Impact", settings: { eyebrow: "BY THE NUMBERS", dark: true } }),
    section("fallback-about", "services", 5, {
      title: "Our Services",
      settings: { eyebrow: "WHAT WE DO", featured_only: true, limit: 4, button_text: "View all →", button_url: "/services" },
    }),
    section("fallback-about", "projects", 6, {
      title: "Recent Projects",
      settings: { eyebrow: "OUR WORK", recent_only: true, limit: 4, button_text: "View all →", button_url: "/projects" },
    }),
    section("fallback-about", "mission_vision", 7, { title: "Mission & Vision" }),
    section("fallback-about", "features", 8, {
      title: "Our Competitive Advantage",
      settings: {
        eyebrow: "WHY CHOOSE US",
        items: [
          { title: "Experienced Team", text: "Skilled professionals committed to delivering exceptional construction results." },
          { title: "Guaranteed Quality", text: "We use premium materials and proven construction methods for long-lasting structures." },
          { title: "Trusted Reputation", text: "We prioritize client satisfaction and timely project delivery." },
        ],
      },
    }),
    section("fallback-about", "cta", 9, {
      title: "Ready To Work With Us?",
      subtitle: "Let's discuss your next construction project and bring your vision to life.",
      settings: { button_text: "Get In Touch", button_url: "/contact" },
    }),
  ],
  services: [
    section("fallback-services", "hero", 1, {
      title: "Construction Services",
      subtitle: "From pre-construction planning to finishing — residential, commercial and infrastructure delivery.",
      settings: { eyebrow: "SERVICES" },
    }),
    section("fallback-services", "services", 2, {
      title: "Our services",
      subtitle: "Browse the full catalogue of published Williams Enterprises services.",
      settings: { eyebrow: "Catalogue", limit: 48 },
    }),
    section("fallback-services", "cta", 3, {
      title: "Need a construction partner?",
      subtitle: "Tell us about the build and we will respond with a practical next step.",
      settings: { button_text: "Request a Quote", button_url: "/contact?type=quote" },
    }),
  ],
  projects: [
    section("fallback-projects", "hero", 1, {
      title: "Construction Projects",
      subtitle: "Explore our completed and ongoing projects demonstrating our commitment to quality and excellence.",
      settings: { eyebrow: "OUR PROJECTS" },
    }),
    section("fallback-projects", "projects", 2, {
      title: "Featured projects",
      subtitle: "Signature builds that show the standard of Williams Enterprises workmanship.",
      settings: { eyebrow: "Featured", featured_only: true, limit: 4 },
    }),
    section("fallback-projects", "projects", 3, {
      title: "All projects",
      settings: { eyebrow: "Portfolio", limit: 48 },
    }),
    section("fallback-projects", "cta", 4, {
      title: "Have a project in mind?",
      subtitle: "Talk to the Williams Enterprises team about construction, development or partnership.",
      settings: { button_text: "Start a conversation", button_url: "/contact" },
    }),
  ],
  gallery: [
    section("fallback-gallery", "hero", 1, {
      title: "Our Construction Portfolio",
      subtitle: "A showcase of our completed projects, construction milestones, and quality workmanship.",
      settings: { eyebrow: "PROJECT GALLERY" },
    }),
    section("fallback-gallery", "gallery", 2, { title: "Gallery", settings: { show_categories: true, limit: 60 } }),
    section("fallback-gallery", "cta", 3, {
      title: "See the work on site",
      subtitle: "Contact Williams Enterprises to discuss your next build.",
      settings: { button_text: "Contact Us", button_url: "/contact" },
    }),
  ],
  news: [
    section("fallback-news", "hero", 1, {
      title: "Latest from Williams Enterprises",
      subtitle: "Industry updates, project highlights, and company news from our team.",
      settings: { eyebrow: "NEWS & INSIGHTS" },
    }),
    section("fallback-news", "news", 2, {
      title: "Featured stories",
      subtitle: "Top stories and announcements from Williams Enterprises.",
      settings: { featured_only: true, limit: 4 },
    }),
    section("fallback-news", "news", 3, { title: "All news", settings: { limit: 24 } }),
    section("fallback-news", "cta", 4, {
      title: "Want to work with us?",
      subtitle: "Get in touch about construction, investment or partnership.",
      settings: { button_text: "Contact Us", button_url: "/contact" },
    }),
  ],
  investors: [
    section("fallback-investors", "hero", 1, {
      title: "Invest in real construction",
      subtitle: "Joint ventures, project capital and long-term partnerships with a Zimbabwe operator that builds.",
      settings: { eyebrow: "Investors", button_text: "Talk to us", button_url: "/contact?type=investment" },
    }),
    section("fallback-investors", "intro", 2, {
      title: "A local builder with institutional discipline",
      subtitle: "Williams Enterprises presents construction, development and partnership opportunities grounded in published work — not invented returns.",
      settings: { eyebrow: "Overview" },
    }),
    section("fallback-investors", "stats", 3, {
      title: "By the numbers",
      settings: { eyebrow: "Portfolio", dark: true, source: "investor" },
    }),
    section("fallback-investors", "opportunities", 4, { title: "How partners work with us", settings: { eyebrow: "Opportunities" } }),
    section("fallback-investors", "pipeline", 5, { title: "Development pipeline", settings: { eyebrow: "Projects" } }),
    section("fallback-investors", "strategy", 6, {
      title: "Investment strategy",
      content:
        "We look for partners who want to back actual construction in Zimbabwe — residential, commercial and infrastructure — with clear scope, accountable delivery and local execution.",
      settings: { eyebrow: "Approach" },
    }),
    section("fallback-investors", "contact_form", 7, {
      title: "Start a confidential conversation",
      subtitle: "Share your interest and the Williams Enterprises team will respond.",
    }),
  ],
  contact: [
    section("fallback-contact", "hero", 1, {
      title: "Let's build together",
      subtitle: "Quotes, site visits, partnerships and investment enquiries — one team in Bulawayo.",
      settings: { eyebrow: "CONTACT" },
    }),
    section("fallback-contact", "contact_info", 2, { title: "Contact information", settings: { eyebrow: "Reach us" } }),
    section("fallback-contact", "contact_form", 3, {
      title: "Send an enquiry",
      subtitle: "Tell us what you need and we will route it to the right person.",
    }),
    section("fallback-contact", "map", 4, { title: "Find us", settings: { eyebrow: "Location" } }),
    section("fallback-contact", "cta", 5, {
      title: "Prefer to talk first?",
      subtitle: "Call or message Williams Enterprises using the numbers in Website Settings.",
      settings: { show_contact: true },
    }),
  ],
};

export function fallbackPage(slug: string) {
  return FALLBACK_PAGES.find((item) => item.slug === slug) ?? null;
}

export function fallbackSections(slug: string) {
  return FALLBACK_SECTIONS[slug] ?? [];
}

export { DEFAULT_NAV };
