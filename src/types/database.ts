export type UserRole = "admin" | "manager" | "sales_manager" | "staff" | "user";
export type ContentStatus = "draft" | "published" | "hidden" | "archived";
export type ReviewStatus = "pending" | "approved" | "hidden";
export type BackgroundType = "image" | "video" | "youtube" | "instagram" | "url";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  pricing_info: string | null;
  features: string[] | null;
  image_url: string | null;
  icon_name: string | null;
  is_trending: boolean;
  is_featured: boolean;
  is_most_requested: boolean;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  details: string | null;
  category: string | null;
  client: string | null;
  location: string | null;
  completion_date: string | null;
  project_status: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_recent: boolean;
  is_trending: boolean;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  caption?: string | null;
  alt_text?: string | null;
  is_featured?: boolean;
  media_type?: "image" | "video";
  video_url?: string | null;
  category: string | null;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  featured_image_url: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_trending: boolean;
  is_featured: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  name: string;
  company_name: string | null;
  rating: number;
  review_text: string;
  image_url: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface Founder {
  id: string;
  name: string;
  title: string | null;
  biography: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroBackground {
  id: string;
  page_key: string;
  background_type: BackgroundType;
  background_url: string | null;
  mobile_background_url: string | null;
  overlay_color: string | null;
  overlay_opacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  business_hours: string | null;
  whatsapp: string | null;
  map_lat: number | null;
  map_lng: number | null;
  map_zoom: number;
  map_marker_title?: string | null;
  company_name?: string | null;
  company_description: string | null;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutContent {
  id: string;
  title: string | null;
  main_description: string | null;
  company_story: string | null;
  mission: string | null;
  vision: string | null;
  values: string[] | null;
  stats: { label: string; value: string }[] | null;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_id: string | null;
  full_name: string;
  position: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  employment_date: string | null;
  salary: number | null;
  status: string;
  profile_image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  payment_status: string;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  vendor: string | null;
  description: string | null;
  receipt_url: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quote_number: string;
  quote_date: string;
  expiry_date: string | null;
  client_name: string;
  client_address: string | null;
  client_email: string | null;
  client_phone: string | null;
  project_name: string | null;
  project_location: string | null;
  description: string | null;
  labour_total: number;
  materials_total: number;
  equipment_total: number;
  subtotal: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  terms_and_conditions: string | null;
  payment_terms: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  item_type: string | null;
  sort_order: number;
  created_at: string;
}

export interface AiKnowledge {
  id: string;
  title: string;
  content: string;
  category: string | null;
  source: string | null;
  keywords: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomeShowcaseSettings {
  id: string;
  is_enabled: boolean;
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  cta_label: string | null;
  cta_url: string | null;
  updated_at: string;
}

export interface HomeShowcaseItem {
  id: string;
  title: string;
  caption: string | null;
  media_url: string;
  media_type: "image" | "video";
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PosSale {
  id: string;
  receipt_number: string;
  sale_date: string;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  payment_method: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: string;
  recorded_by: string | null;
  recorded_by_name: string | null;
  recorded_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface PosSaleItem {
  id: string;
  sale_id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  line_total: number;
  sort_order: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      project_images: { Row: ProjectImage; Insert: Partial<ProjectImage>; Update: Partial<ProjectImage> };
      gallery_items: { Row: GalleryItem; Insert: Partial<GalleryItem>; Update: Partial<GalleryItem> };
      news_articles: { Row: NewsArticle; Insert: Partial<NewsArticle>; Update: Partial<NewsArticle> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      founders: { Row: Founder; Insert: Partial<Founder>; Update: Partial<Founder> };
      hero_backgrounds: { Row: HeroBackground; Insert: Partial<HeroBackground>; Update: Partial<HeroBackground> };
      contact_settings: { Row: ContactSettings; Insert: Partial<ContactSettings>; Update: Partial<ContactSettings> };
      social_links: { Row: SocialLink; Insert: Partial<SocialLink>; Update: Partial<SocialLink> };
      about_content: { Row: AboutContent; Insert: Partial<AboutContent>; Update: Partial<AboutContent> };
      newsletter_subscribers: { Row: NewsletterSubscriber; Insert: Partial<NewsletterSubscriber>; Update: Partial<NewsletterSubscriber> };
      contact_messages: { Row: ContactMessage; Insert: Partial<ContactMessage>; Update: Partial<ContactMessage> };
      employees: { Row: Employee; Insert: Partial<Employee>; Update: Partial<Employee> };
      payroll_records: { Row: PayrollRecord; Insert: Partial<PayrollRecord>; Update: Partial<PayrollRecord> };
      expenses: { Row: Expense; Insert: Partial<Expense>; Update: Partial<Expense> };
      quotations: { Row: Quotation; Insert: Partial<Quotation>; Update: Partial<Quotation> };
      quotation_items: { Row: QuotationItem; Insert: Partial<QuotationItem>; Update: Partial<QuotationItem> };
      ai_knowledge: { Row: AiKnowledge; Insert: Partial<AiKnowledge>; Update: Partial<AiKnowledge> };
      activity_logs: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
      site_settings: { Row: SiteSetting; Insert: Partial<SiteSetting>; Update: Partial<SiteSetting> };
      faqs: { Row: Faq; Insert: Partial<Faq>; Update: Partial<Faq> };
      home_showcase_settings: {
        Row: HomeShowcaseSettings;
        Insert: Partial<HomeShowcaseSettings>;
        Update: Partial<HomeShowcaseSettings>;
      };
      home_showcase_items: {
        Row: HomeShowcaseItem;
        Insert: Partial<HomeShowcaseItem>;
        Update: Partial<HomeShowcaseItem>;
      };
      pos_sales: { Row: PosSale; Insert: Partial<PosSale>; Update: Partial<PosSale> };
      pos_sale_items: { Row: PosSaleItem; Insert: Partial<PosSaleItem>; Update: Partial<PosSaleItem> };
    };
  };
}
