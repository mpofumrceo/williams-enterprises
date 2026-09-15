import Link from "next/link";
import { getAdminPages } from "@/src/lib/data/cms";
import { PageHeader } from "@/src/components/admin/AdminCard";

export default async function WebsitePagesPage() {
  const pages = await getAdminPages();

  return (
    <div>
      <PageHeader
        title="Website pages"
        description="Edit every public page from this dashboard. Changes publish after you save."
      />
      <div className="overflow-x-auto rounded-3xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sections</th>
              <th className="px-4 py-3 font-medium">UI style</th>
              <th className="px-4 py-3 font-medium">Last updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/70">
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-navy">{page.title}</td>
                <td className="px-4 py-3">{page.published ? "Published" : "Draft"}</td>
                <td className="px-4 py-3">{page.section_count}</td>
                <td className="px-4 py-3 capitalize">{page.ui_style ?? "Default"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {page.updated_at ? new Date(page.updated_at).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/website/${page.slug}`} className="font-semibold text-amber-700">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Run <code>supabase/migrations/cms_theme_engine.sql</code> in the Supabase SQL Editor to create pages.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
