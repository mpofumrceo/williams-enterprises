import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, CheckCircle, Mail, MapPin, Phone, Clock, Navigation } from "lucide-react";
import HeroBackground from "@/src/components/hero/HeroBackground";
import HomeHeroContent from "@/src/components/hero/HomeHeroContent";
import {
  FadeIn,
  SlideIn,
  RevealUp,
  ScaleIn,
  StaggerChildren,
  StaggerItem,
} from "@/src/components/animations/AnimatedSection";
import ServiceCard from "@/src/components/services/ServiceCard";
import ProjectCard from "@/src/components/projects/ProjectCard";
import NewsCard from "@/src/components/news/NewsCard";
import ReviewSection from "@/src/components/reviews/ReviewSection";
import FAQSection from "@/src/components/FAQSection";
import { SectionHeading, SkeuoCard, StatTile } from "@/src/components/ui/surfaces";
import { OpportunityCards, PipelineChart } from "@/src/components/investors/InvestorVisuals";
import SmartContactForm from "@/src/components/forms/SmartContactForm";
import ContactForm from "@/src/components/forms/ContactForm";
import ContactMap from "@/src/components/forms/ContactMap";
import { isVideoUrl } from "@/src/lib/utils/media";
import { parsePhones, telHref } from "@/src/lib/utils/contact";
import { resolveUiStyle } from "@/src/lib/cms/theme";
import type { PageSection, SitePage } from "@/src/lib/cms/types";
import type { UiStyle } from "@/src/lib/cms/constants";
import { SectionShell } from "./SectionShell";
import type { CmsPageData } from "./page-data";

const VideoAdShowcase = dynamic(() => import("@/src/components/home/VideoAdShowcase"));

function CtaLink({
  href,
  children,
  primary,
  newTab,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={
        primary
          ? "btn-skeuo inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
          : "inline-flex items-center gap-2 font-semibold text-amber-700 hover:text-amber-800"
      }
      style={
        primary
          ? { background: "var(--color-button)", color: "var(--color-button-text)" }
          : undefined
      }
    >
      {children}
    </Link>
  );
}

function pickServices(data: CmsPageData, section: PageSection) {
  const limit = Number(section.settings.limit ?? 4);
  const featured = data.services.filter((s) => s.is_featured);
  const source = section.settings.featured_only ? featured.length ? featured : data.services : data.services;
  return source.slice(0, limit);
}

function pickProjects(data: CmsPageData, section: PageSection) {
  const limit = Number(section.settings.limit ?? 4);
  if (section.settings.featured_only) {
    const featured = data.projects.filter((p) => p.is_featured);
    return (featured.length ? featured : data.projects).slice(0, limit);
  }
  if (section.settings.recent_only) {
    const recent = data.projects.filter((p) => p.is_recent);
    return (recent.length ? recent : data.projects).slice(0, limit);
  }
  return data.projects.slice(0, limit);
}

function pickNews(data: CmsPageData, section: PageSection) {
  const limit = Number(section.settings.limit ?? 3);
  if (section.settings.featured_only) {
    const featured = data.news.filter((a) => a.is_featured);
    return (featured.length ? featured : data.news).slice(0, limit);
  }
  return data.news.slice(0, limit);
}

function statsFor(data: CmsPageData, section: PageSection) {
  if (section.settings.source === "investor" && data.investorStats.length) {
    return data.investorStats.map((s) => ({ value: s.value, label: s.label }));
  }
  if (data.about?.stats?.length) return data.about.stats;
  return [
    { value: `${data.services.length || "—"}`, label: "Published services" },
    { value: `${data.projects.length || "—"}`, label: "Published projects" },
    { value: "Zimbabwe", label: "Operating market" },
  ];
}

function HeroBlock({
  section,
  data,
  slug,
}: {
  section: PageSection;
  data: CmsPageData;
  slug: string;
}) {
  const settings = section.settings;
  const heading = section.title ?? "";
  const sub = section.subtitle ?? section.content ?? "";
  const centered = slug !== "home" && slug !== "investors";

  if (slug === "home") {
    return (
      <HeroBackground hero={data.hero}>
        <HomeHeroContent
          stats={settings.show_stats === false ? [] : statsFor(data, section).slice(0, 3)}
          phone={parsePhones(data.contact?.phone)[0]}
          eyebrow={settings.eyebrow}
          heading={heading}
          headingLine2={settings.heading_line_2}
          subheading={sub}
          buttonText={settings.button_text}
          buttonUrl={settings.button_url}
          button2Text={settings.button2_text}
          button2Url={settings.button2_url}
          showPhone={settings.show_phone !== false}
        />
      </HeroBackground>
    );
  }

  const stats = slug === "investors" ? statsFor(data, section).slice(0, 4) : [];

  return (
    <HeroBackground hero={data.hero}>
      <div className="mx-auto grid min-h-dvh max-w-7xl items-center gap-8 px-6 py-28 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeIn className={centered && !stats.length ? "mx-auto max-w-3xl text-center lg:col-span-2" : ""}>
          {settings.eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              {settings.eyebrow}
            </p>
          )}
          <h1 className="mt-4 text-5xl font-extrabold text-white md:text-6xl">{heading}</h1>
          {sub && <p className="mt-6 max-w-xl text-lg text-slate-200 md:text-xl">{sub}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {settings.button_text && settings.button_url && (
              <CtaLink href={settings.button_url} primary newTab={settings.button_new_tab}>
                {settings.button_text} <ArrowRight size={16} />
              </CtaLink>
            )}
            {settings.button2_text && settings.button2_url && (
              <Link
                href={settings.button2_url}
                className="inline-flex rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md"
              >
                {settings.button2_text}
              </Link>
            )}
          </div>
        </FadeIn>
        {stats.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="cms-surface panel-glass p-5">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </HeroBackground>
  );
}

export function PageSectionRenderer({
  section,
  page,
  data,
  globalStyle,
  enquiryType,
}: {
  section: PageSection;
  page: SitePage;
  data: CmsPageData;
  globalStyle: UiStyle;
  enquiryType?: string;
}) {
  const pageStyle = page.ui_style;
  const resolved = resolveUiStyle(section.ui_style, pageStyle, globalStyle);
  const settings = section.settings;
  const dark = Boolean(settings.dark);
  const heading = section.title ?? "";
  const description = section.subtitle ?? section.content ?? undefined;

  if (section.section_type === "hero") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle}>
        <HeroBlock section={section} data={data} slug={page.slug} />
      </SectionShell>
    );
  }

  if (section.section_type === "showcase") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle}>
        <VideoAdShowcase
          settings={data.showcase.settings}
          items={data.showcase.items}
          services={data.services.slice(0, 8)}
        />
      </SectionShell>
    );
  }

  if (section.section_type === "intro") {
    const founder = data.founders[0];
    const values = data.about?.values ?? [];
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <SlideIn from="left">
            <SectionHeading
              eyebrow={settings.eyebrow ?? "Company"}
              title={heading || data.about?.title || "About Williams Enterprises"}
              description={description || data.about?.main_description || undefined}
            />
            {data.about?.company_story && (
              <p className="mt-4 text-lg text-slate-600">{data.about.company_story}</p>
            )}
            {settings.button_text && settings.button_url && (
              <div className="mt-8">
                <CtaLink href={settings.button_url}>
                  {settings.button_text} <ArrowRight size={18} />
                </CtaLink>
              </div>
            )}
          </SlideIn>
          {settings.show_values && values.length > 0 ? (
            <SkeuoCard className="cms-surface p-10">
              <h3 className="mb-8 text-2xl font-bold text-navy">Our Core Values</h3>
              <div className="space-y-5">
                {values.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="shrink-0 text-amber-600" size={20} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </SkeuoCard>
          ) : settings.show_founder !== false && founder ? (
            <SlideIn from="right" delay={0.1}>
              <SkeuoCard className="cms-surface overflow-hidden">
                <div className="relative h-72 bg-navy sm:h-80">
                  {founder.image_url ? (
                    <Image src={founder.image_url} alt={founder.name} fill sizes="50vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-bold text-amber-400">
                      {founder.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-navy">{founder.name}</h3>
                  {founder.title && <p className="mt-1 font-medium text-amber-700">{founder.title}</p>}
                  {founder.biography && <p className="mt-4 line-clamp-4 text-gray-600">{founder.biography}</p>}
                </div>
              </SkeuoCard>
            </SlideIn>
          ) : section.image ? (
            <div className="relative h-80 overflow-hidden rounded-3xl">
              <Image src={section.image} alt={heading} fill className="object-cover" />
            </div>
          ) : null}
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "text" || section.section_type === "strategy") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHeading
            eyebrow={settings.eyebrow ?? "Overview"}
            title={heading}
            description={description}
            light={dark}
          />
          {section.content && heading !== section.content && (
            <p className="mt-6 whitespace-pre-wrap text-lg text-slate-600">{section.content}</p>
          )}
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "stats") {
    const stats = statsFor(data, section);
    if (!stats.length) return null;
    return (
      <SectionShell
        section={section}
        pageStyle={pageStyle}
        globalStyle={globalStyle}
        className={dark ? "bg-navy py-20" : "py-20"}
      >
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-10 text-center">
            <SectionHeading
              light={dark}
              eyebrow={settings.eyebrow ?? "By the numbers"}
              title={heading || "Williams Enterprises at a glance"}
            />
          </FadeIn>
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StaggerItem key={`${stat.label}-${i}`}>
                {dark ? (
                  <StatTile glass value={stat.value} label={stat.label} />
                ) : (
                  <StatTile value={stat.value} label={stat.label} />
                )}
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "services") {
    const items = pickServices(data, section);
    if (!items.length) return null;
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <RevealUp>
            <SectionHeading
              eyebrow={settings.eyebrow ?? "Services"}
              title={heading || "Services"}
              description={description}
              light={dark}
            />
          </RevealUp>
          <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} hoverReveal />
              </StaggerItem>
            ))}
          </StaggerChildren>
          {settings.button_text && settings.button_url && (
            <div className="mt-10 text-center">
              <CtaLink href={settings.button_url}>{settings.button_text}</CtaLink>
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "projects") {
    const items = pickProjects(data, section);
    if (!items.length) return null;
    return (
      <SectionShell
        section={section}
        pageStyle={pageStyle}
        globalStyle={globalStyle}
        className={dark ? "bg-navy py-24" : "py-24"}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            light={dark}
            eyebrow={settings.eyebrow ?? "Portfolio"}
            title={heading || "Projects"}
            description={description}
          />
          <StaggerChildren className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} tone={dark ? "dark" : "light"} />
              </StaggerItem>
            ))}
          </StaggerChildren>
          {settings.button_text && settings.button_url && (
            <div className="mt-10 text-center">
              <CtaLink href={settings.button_url} primary={dark}>
                {settings.button_text} {dark ? <ArrowRight size={18} /> : null}
              </CtaLink>
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "features") {
    const items = settings.items ?? [];
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={settings.eyebrow ?? "Why us"}
            title={heading}
            description={description}
            light={dark}
          />
          <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <StaggerItem key={item.title}>
                <SkeuoCard className="cms-surface h-full p-7">
                  <h3 className="text-lg font-bold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </SkeuoCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "investment") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="relative overflow-hidden bg-navy py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <FadeIn>
              <SectionHeading
                light
                eyebrow={settings.eyebrow ?? "Investment"}
                title={heading}
                description={description}
              />
              {settings.button_text && settings.button_url && (
                <div className="mt-8">
                  <CtaLink href={settings.button_url} primary>
                    {settings.button_text} <ArrowRight size={18} />
                  </CtaLink>
                </div>
              )}
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatTile glass value={`${data.projects.length || "—"}`} label="Projects on the site" />
              <StatTile glass value={`${data.services.length || "—"}`} label="Published services" />
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "gallery") {
    const images = data.gallery.filter((g) => !isVideoUrl(g.image_url)).slice(0, Number(settings.limit ?? 12));
    const categories = settings.show_categories
      ? [...new Set(data.gallery.map((item) => item.category).filter(Boolean))]
      : [];
    if (!images.length && !categories.length) return null;
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={settings.eyebrow ?? "Gallery"}
            title={heading || "Gallery"}
            description={description}
          />
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map((cat) => (
                <span key={cat} className="cms-surface rounded-full px-5 py-2 text-sm font-medium text-navy">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <StaggerChildren className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
            {images.map((item) => (
              <StaggerItem key={item.id} className="mb-6 break-inside-avoid">
                <div className="frame-skeuo cms-surface overflow-hidden rounded-2xl">
                  <Image
                    src={item.image_url}
                    alt={item.alt_text || item.title || "Gallery"}
                    width={800}
                    height={600}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
          {settings.button_text && settings.button_url && (
            <div className="mt-8 text-center">
              <CtaLink href={settings.button_url}>{settings.button_text}</CtaLink>
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "news") {
    const items = pickNews(data, section);
    if (!items.length) return null;
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={settings.eyebrow ?? "News"} title={heading || "News"} description={description} />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {items.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "reviews") {
    return data.reviews.length ? <ReviewSection reviews={data.reviews} /> : null;
  }

  if (section.section_type === "faq") {
    return data.faqs.length ? <FAQSection faqs={data.faqs} /> : null;
  }

  if (section.section_type === "leadership") {
    if (!data.founders.length) return null;
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <SectionHeading eyebrow={settings.eyebrow ?? "Leadership"} title={heading || "Leadership"} />
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.founders.map((founder) => (
              <SkeuoCard key={founder.id} className="cms-surface overflow-hidden">
                <div className="relative h-72 bg-navy">
                  {founder.image_url ? (
                    <Image src={founder.image_url} alt={founder.name} fill className="object-cover" sizes="33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-bold text-amber-400">
                      {founder.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-navy">{founder.name}</h3>
                  {founder.title && <p className="mt-1 font-medium text-amber-600">{founder.title}</p>}
                  {founder.biography && <p className="mt-4 text-gray-600">{founder.biography}</p>}
                </div>
              </SkeuoCard>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "mission_vision") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2">
          <SkeuoCard className="cms-surface p-10">
            <h3 className="text-3xl font-bold text-navy">Our Mission</h3>
            <p className="mt-4 text-gray-600">
              {data.about?.mission ??
                "To provide reliable, innovative, and affordable construction solutions that exceed client expectations."}
            </p>
          </SkeuoCard>
          <SkeuoCard className="cms-surface p-10">
            <h3 className="text-3xl font-bold text-navy">Our Vision</h3>
            <p className="mt-4 text-gray-600">
              {data.about?.vision ??
                "To become one of Africa's most respected construction companies known for excellence and innovation."}
            </p>
          </SkeuoCard>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "opportunities") {
    const cards = data.opportunities.length
      ? data.opportunities.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          investment_requirement: item.investment_requirement,
        }))
      : [
          { id: "jv", title: "Joint ventures", description: "Co-develop residential, commercial and infrastructure projects with shared local delivery.", investment_requirement: null },
          { id: "pc", title: "Project capital", description: "Fund specific builds from groundbreaking through handover, with clear scope and reporting.", investment_requirement: null },
          { id: "sp", title: "Strategic partnerships", description: "Long-term alliances across construction, renovation and engineering services.", investment_requirement: null },
        ];
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24" id="opportunities">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={settings.eyebrow ?? "Opportunities"} title={heading} description={description} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {cards.map((item) => (
              <SkeuoCard key={item.id} className="cms-surface p-8">
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                {item.description && <p className="mt-3 text-slate-600">{item.description}</p>}
                {item.investment_requirement && (
                  <p className="mt-4 text-sm font-medium text-amber-700">{item.investment_requirement}</p>
                )}
              </SkeuoCard>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "pipeline") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={settings.eyebrow ?? "Pipeline"} title={heading || "Development pipeline"} />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <SkeuoCard className="cms-surface p-6">
              <h3 className="mb-4 font-semibold text-navy">Projects by category</h3>
              <PipelineChart projects={data.projects} />
            </SkeuoCard>
            <div className="grid gap-4">
              <OpportunityCards projects={data.projects.slice(0, 6)} />
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "contact_info") {
    const phones = parsePhones(data.contact?.phone);
    const hours = data.contact?.business_hours?.split("\n").filter(Boolean) ?? [];
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="panel-skeuo-dark cms-surface rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold">{heading || "Studio details"}</h2>
            <div className="mt-8 grid gap-6 text-slate-200 md:grid-cols-2">
              {phones.map((phone) => (
                <a key={phone} href={telHref(phone)} className="flex gap-3 hover:text-amber-300">
                  <Phone className="text-amber-400" size={20} /> {phone}
                </a>
              ))}
              {data.contact?.email && (
                <a href={`mailto:${data.contact.email}`} className="flex gap-3 hover:text-amber-300">
                  <Mail className="text-amber-400" size={20} /> {data.contact.email}
                </a>
              )}
              {data.contact?.address && (
                <p className="flex gap-3">
                  <MapPin className="text-amber-400" size={20} /> {data.contact.address}
                </p>
              )}
              {hours.length > 0 && (
                <div className="flex gap-3">
                  <Clock className="text-amber-400" size={20} />
                  <div>
                    {hours.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "contact_form") {
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="py-16" id="investor-inquiry">
        <div className="mx-auto max-w-7xl px-6">
          <SkeuoCard className="cms-surface p-6 md:p-10">
            <SectionHeading eyebrow={settings.eyebrow ?? "Enquiry"} title={heading || "How can we help?"} description={description} />
            <div className="mt-8">
              {page.slug === "investors" ? (
                <ContactForm
                  source="investor"
                  messagePlaceholder="Share partnership type, timeline and what you would like to review..."
                  submitLabel="Request investor information"
                />
              ) : (
                <SmartContactForm initialType={enquiryType} />
              )}
            </div>
          </SkeuoCard>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "map") {
    const lat = data.contact?.map_lat ?? -20.1561;
    const lng = data.contact?.map_lng ?? 28.5889;
    const zoom = data.contact?.map_zoom ?? 13;
    const label = data.contact?.map_marker_title || data.contact?.address || "Williams Enterprises";
    const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    return (
      <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle} className="pb-24" id="location">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={settings.eyebrow ?? "Find us"} title={heading || "Location"} description={description} />
          <div className="relative mt-8 overflow-hidden rounded-[2rem] frame-skeuo">
            <ContactMap lat={lat} lng={lng} zoom={zoom} label={label} />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 md:left-6 md:w-80">
              <div className="pointer-events-auto cms-surface panel-glass rounded-2xl p-5 text-white">
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-sm text-slate-200">{data.contact?.address ?? "Bulawayo, Zimbabwe"}</p>
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--color-button)", color: "var(--color-button-text)" }}
                >
                  <Navigation size={14} /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.section_type === "cta") {
    const phones = parsePhones(data.contact?.phone);
    return (
      <ScaleIn className="px-4 pb-16">
        <SectionShell section={section} pageStyle={pageStyle} globalStyle={globalStyle}>
          <div className="panel-skeuo-dark mx-auto max-w-5xl rounded-[2rem] px-6 py-16 text-center md:px-12">
            <h2 className="text-4xl font-bold text-white">{heading}</h2>
            {description && <p className="mt-5 text-lg text-slate-300">{description}</p>}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {settings.button_text && settings.button_url && (
                <CtaLink href={settings.button_url} primary>
                  {settings.button_text}
                </CtaLink>
              )}
              {settings.button2_text && settings.button2_url && (
                <Link
                  href={settings.button2_url}
                  className="inline-flex rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white hover:bg-white/10"
                >
                  {settings.button2_text}
                </Link>
              )}
            </div>
            {settings.show_contact && (
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
                {phones.map((phone) => (
                  <a key={phone} href={telHref(phone)} className="inline-flex items-center gap-2">
                    <Phone size={16} /> {phone}
                  </a>
                ))}
                {data.contact?.email && (
                  <a href={`mailto:${data.contact.email}`} className="inline-flex items-center gap-2">
                    <Mail size={16} /> {data.contact.email}
                  </a>
                )}
                {data.contact?.address && (
                  <Link href="/contact#location" className="inline-flex items-center gap-2">
                    <MapPin size={16} /> View location
                  </Link>
                )}
              </div>
            )}
          </div>
        </SectionShell>
      </ScaleIn>
    );
  }

  void resolved;
  return null;
}
