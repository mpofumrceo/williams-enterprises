"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Faq } from "@/src/types/database";
import { createFaq, updateFaq, deleteFaq } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function FaqForm({ faq, onDone }: { faq?: Faq; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = faq ? await updateFaq(faq.id, formData) : await createFaq(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(faq ? "FAQ updated" : "FAQ added");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="question" label="Question" defaultValue={faq?.question} required />
      <Textarea name="answer" label="Answer" rows={4} defaultValue={faq?.answer} required />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="category" label="Category" defaultValue={faq?.category ?? ""} placeholder="General, Services..." />
        <Input name="sort_order" label="Sort Order" type="number" defaultValue={faq?.sort_order ?? 0} />
      </div>
      <FormCheckbox name="is_published" label="Published on website" defaultChecked={faq?.is_published ?? true} />
      <Button type="submit" loading={pending}>
        {faq ? "Update FAQ" : "Add FAQ"}
      </Button>
    </form>
  );
}

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="FAQ Management"
        description="Add, edit, or delete frequently asked questions shown on the website."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add FAQ"}
          </Button>
        }
      />

      {showAdd && (
        <AdminCard title="Add FAQ" className="mb-6">
          <FaqForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}

      <AdminCard title={`FAQs (${faqs.length})`}>
        {faqs.length === 0 ? (
          <EmptyState title="No FAQs yet" description="Add your first question above." />
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-navy">{faq.question}</h4>
                      <StatusBadge status={faq.is_published ? "published" : "draft"} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{faq.answer}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {faq.category || "Uncategorized"} · Order: {faq.sort_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(editingId === faq.id ? null : faq.id)}
                    >
                      {editingId === faq.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteFaq(faq.id)} />
                  </div>
                </div>
                {editingId === faq.id && (
                  <div className="mt-4 border-t pt-4">
                    <FaqForm faq={faq} onDone={() => setEditingId(null)} />
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
