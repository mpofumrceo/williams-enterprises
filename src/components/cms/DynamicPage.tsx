import { resolveUiStyle } from "@/src/lib/cms/theme";
import { PageSectionRenderer } from "./PageSectionRenderer";
import type { DynamicPageProps } from "./page-data";

export type { CmsPageData } from "./page-data";

export function DynamicPage({
  page,
  sections,
  data,
  globalStyle,
  enquiryType,
  preview,
}: DynamicPageProps) {
  const pageStyle = resolveUiStyle(null, page.ui_style, globalStyle);
  const visible = preview ? sections.filter((s) => s.visible !== false) : sections;

  return (
    <div className="bg-transparent text-slate-900" data-page-ui={pageStyle} data-page={page.slug}>
      {preview && (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Preview mode — unpublished sections may appear
        </div>
      )}
      {visible.map((section) => (
        <PageSectionRenderer
          key={section.id}
          section={section}
          page={page}
          data={data}
          globalStyle={globalStyle}
          enquiryType={enquiryType}
        />
      ))}
    </div>
  );
}
