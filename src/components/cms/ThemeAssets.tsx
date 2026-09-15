import { googleFontsHref, themeStyleAttribute, type SiteTheme } from "@/src/lib/cms/theme";
import type { SiteBranding } from "@/src/lib/cms/types";

export function ThemeAssets({
  theme,
  branding,
}: {
  theme: SiteTheme;
  branding?: SiteBranding | null;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={googleFontsHref(theme)} />
      {branding?.favicon_url ? <link rel="icon" href={branding.favicon_url} /> : null}
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${themeStyleAttribute(theme)} }`,
        }}
      />
    </>
  );
}
