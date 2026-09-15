import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/src/components/ui/ToasterProvider";
import { ThemeAssets } from "@/src/components/cms/ThemeAssets";
import { getSiteBranding, getSiteTheme } from "@/src/lib/data/cms";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getSiteBranding();
  return {
    title: {
      default: branding.seo_title || `${branding.company_name} | Building Today, Transforming Tomorrow`,
      template: `%s | ${branding.company_name}`,
    },
    description: branding.seo_description || undefined,
    keywords: branding.seo_keywords?.split(",").map((item) => item.trim()),
    icons: branding.favicon_url ? { icon: branding.favicon_url } : undefined,
    openGraph: {
      siteName: branding.company_name,
      locale: "en_ZW",
      type: "website",
      images: branding.default_og_image ? [{ url: branding.default_og_image }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, branding] = await Promise.all([getSiteTheme(), getSiteBranding()]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-ui-style={theme.default_ui_style}
      data-animation={theme.animation_level}
      data-hover={theme.enable_hover_effects ? "on" : "off"}
    >
      <head>
        <ThemeAssets theme={theme} branding={branding} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
