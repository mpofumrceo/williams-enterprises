import type {
  AboutContent,
  ContactSettings,
  Faq,
  Founder,
  GalleryItem,
  HeroBackground,
  HomeShowcaseItem,
  HomeShowcaseSettings,
  NewsArticle,
  Project,
  Review,
  Service,
  SocialLink,
} from "@/src/types/database";
import type { InvestorOpportunity, InvestorStatistic, PageSection, SitePage } from "@/src/lib/cms/types";
import type { UiStyle } from "@/src/lib/cms/constants";

export interface CmsPageData {
  hero: HeroBackground | null;
  services: Service[];
  projects: Project[];
  gallery: GalleryItem[];
  news: NewsArticle[];
  reviews: Review[];
  founders: Founder[];
  about: AboutContent | null;
  contact: ContactSettings | null;
  faqs: Faq[];
  showcase: { settings: HomeShowcaseSettings | null; items: HomeShowcaseItem[] };
  socialLinks: SocialLink[];
  opportunities: InvestorOpportunity[];
  investorStats: InvestorStatistic[];
}

export interface DynamicPageProps {
  page: SitePage;
  sections: PageSection[];
  data: CmsPageData;
  globalStyle: UiStyle;
  enquiryType?: string;
  preview?: boolean;
}
