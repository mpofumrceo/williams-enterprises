import { getContactSettings, getSocialLinks } from "@/src/lib/data/public";
import { getFooterSettings, getNavigationItems, getSiteBranding } from "@/src/lib/data/cms";
import FooterClient from "./FooterClient";
import NewsletterForm from "@/src/components/forms/NewsletterForm";

export default async function Footer() {
  const [contact, socialLinks, footer, navItems, branding] = await Promise.all([
    getContactSettings(),
    getSocialLinks(),
    getFooterSettings(),
    getNavigationItems("footer"),
    getSiteBranding(),
  ]);

  return (
    <FooterClient
      contact={contact}
      socialLinks={socialLinks}
      newsletter={footer.show_newsletter ? <NewsletterForm /> : null}
      footer={footer}
      links={navItems.map((item) => ({ href: item.url, label: item.label }))}
      companyName={branding.company_name}
      tagline={branding.tagline}
    />
  );
}
