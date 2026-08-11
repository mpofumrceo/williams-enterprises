"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { NewsArticle } from "@/src/types/database";
import { createNews, updateNews, deleteNews } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

function NewsForm({ article, onDone }: { article?: NewsArticle; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = article ? await updateNews(article.id, formData) : await createNews(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(article ? "Article updated" : "Article created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" label="Title" defaultValue={article?.title} required />
        <Input name="author" label="Author" defaultValue={article?.author ?? ""} />
        <Input name="category" label="Category" defaultValue={article?.category ?? ""} />
        <SelectField name="status" label="Status" defaultValue={article?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="featured_image_url"
        label="Featured Image or Video"
        bucket="news"
        folder="featured"
        defaultValue={article?.featured_image_url}
        kind="media"
      />
      <Textarea name="excerpt" label="Excerpt" rows={2} defaultValue={article?.excerpt ?? ""} />
      <Textarea name="content" label="Content" rows={6} defaultValue={article?.content ?? ""} />
      <div className="flex gap-4">
        <FormCheckbox name="is_featured" label="Featured" defaultChecked={article?.is_featured} />
        <FormCheckbox name="is_trending" label="Trending" defaultChecked={article?.is_trending} />
      </div>
      <Button type="submit" loading={pending}>{article ? "Update Article" : "Create Article"}</Button>
    </form>
  );
}

export default function NewsClient({ articles }: { articles: NewsArticle[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="News"
        description="Manage news articles and announcements."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Article"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add Article" className="mb-6">
          <NewsForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Articles (${articles.length})`}>
        {articles.length === 0 ? (
          <EmptyState title="No articles yet" />
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy">{a.title}</h4>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{a.excerpt}</p>
                    <p className="text-xs text-slate-400">
                      {a.author} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Not published"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === a.id ? null : a.id)}>
                      {editingId === a.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteNews(a.id)} />
                  </div>
                </div>
                {editingId === a.id && (
                  <div className="mt-4 border-t pt-4">
                    <NewsForm article={a} onDone={() => setEditingId(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
