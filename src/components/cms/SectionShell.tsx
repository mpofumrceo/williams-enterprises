import { cn } from "@/src/lib/utils/cn";
import { resolveUiStyle, uiStyleClass } from "@/src/lib/cms/theme";
import type { PageSection } from "@/src/lib/cms/types";
import type { UiStyle } from "@/src/lib/cms/constants";

export function sectionBackgroundStyle(section: PageSection): React.CSSProperties | undefined {
  if (section.background_type === "color" && section.background_value) {
    return { background: section.background_value };
  }
  if (section.background_type === "gradient" && section.background_value) {
    return { background: section.background_value };
  }
  if (section.background_type === "image" && section.background_value) {
    return {
      backgroundImage: `url(${section.background_value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return undefined;
}

export function SectionShell({
  section,
  pageStyle,
  globalStyle,
  children,
  className,
  id,
}: {
  section: PageSection;
  pageStyle: UiStyle | null;
  globalStyle: UiStyle;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const style = resolveUiStyle(section.ui_style, pageStyle, globalStyle);
  const dark = Boolean(section.settings.dark);

  return (
    <section
      id={id}
      data-ui-style={style}
      data-section-type={section.section_type}
      className={cn("cms-section", uiStyleClass(style), dark && "bg-navy text-white", className)}
      style={sectionBackgroundStyle(section)}
    >
      {children}
    </section>
  );
}
