import { getSocialLinks } from "@/src/lib/data/public";
import { getFooterSettings, getNavigationItems, getSiteBranding } from "@/src/lib/data/cms";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const [socialLinks, navItems, branding, footer] = await Promise.all([
    getSocialLinks(),
    getNavigationItems("header"),
    getSiteBranding(),
    getFooterSettings(),
  ]);
  return (
    <NavbarClient
      socialLinks={socialLinks}
      links={navItems.map((item) => ({ name: item.label, href: item.url, newTab: item.open_in_new_tab }))}
      companyName={branding.company_name}
      tagline={branding.tagline}
      logoUrl={branding.logo_url || "/logo.png"}
      ctaText={footer.cta_text || "Get a Quote"}
      ctaUrl={footer.cta_url || "/contact"}
    />
  );
}
