"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AiKnowledge } from "@/src/types/database";
import { createKnowledge, updateKnowledge, deleteKnowledge } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { MiwillyTestChat } from "@/src/components/admin/MiwillyTestChat";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

function KnowledgeForm({ item, onDone }: { item?: AiKnowledge; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = item ? await updateKnowledge(item.id, formData) : await createKnowledge(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(item ? "Knowledge updated" : "Knowledge added");
        onDone?.();
      }
    });
  }

  const keywordsStr = item?.keywords ? JSON.stringify(item.keywords) : "[]";

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" label="Title" defaultValue={item?.title} required />
        <Input name="category" label="Category" defaultValue={item?.category ?? ""} />
        <Input name="source" label="Source" defaultValue={item?.source ?? "manual"} />
        <Input name="keywords" label="Keywords (JSON array)" defaultValue={keywordsStr} />
      </div>
      <Textarea name="content" label="Content" rows={6} defaultValue={item?.content} required />
      <FormCheckbox name="is_active" label="Active" defaultChecked={item?.is_active ?? true} />
      <Button type="submit" loading={pending}>{item ? "Update" : "Add Knowledge"}</Button>
    </form>
  );
}

export default function MiwillyClient({ knowledge }: { knowledge: AiKnowledge[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Stebo Ai Knowledge"
        description="Manage Stebo Ai knowledge base and test responses."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Knowledge"}
          </Button>
        }
      />
      <div className={`mb-6 grid gap-6 ${showAdd ? "lg:grid-cols-2" : ""}`}>
        <AdminCard title="Test Chat">
          <MiwillyTestChat />
        </AdminCard>
        {showAdd && (
          <AdminCard title="Add Knowledge">
            <KnowledgeForm onDone={() => setShowAdd(false)} />
          </AdminCard>
        )}
      </div>
      <AdminCard title={`Knowledge Base (${knowledge.length})`}>
        {knowledge.length === 0 ? (
          <EmptyState title="No knowledge entries" />
        ) : (
          <div className="space-y-4">
            {knowledge.map((k) => (
              <div key={k.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy">{k.title}</h4>
                      <StatusBadge status={k.is_active ? "active" : "inactive"} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{k.content}</p>
                    <p className="text-xs text-slate-400">{k.category} · {k.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === k.id ? null : k.id)}>
                      {editingId === k.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteKnowledge(k.id)} />
                  </div>
                </div>
                {editingId === k.id && (
                  <div className="mt-4 border-t pt-4">
                    <KnowledgeForm item={k} onDone={() => setEditingId(null)} />
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
