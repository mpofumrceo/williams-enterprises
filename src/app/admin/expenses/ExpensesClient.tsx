"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Expense } from "@/src/types/database";
import { createExpense, updateExpense, deleteExpense } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

const STATUS_OPTIONS = [
  { value: "recorded", label: "Recorded" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
];

function ExpenseForm({ expense, onDone }: { expense?: Expense; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = expense ? await updateExpense(expense.id, formData) : await createExpense(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(expense ? "Expense updated" : "Expense created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" label="Name" defaultValue={expense?.name} required />
        <Input name="category" label="Category" defaultValue={expense?.category ?? ""} />
        <Input name="amount" label="Amount" type="number" step="0.01" defaultValue={expense?.amount ?? 0} required />
        <Input name="currency" label="Currency" defaultValue={expense?.currency ?? "USD"} />
        <Input name="expense_date" label="Date" type="date" defaultValue={expense?.expense_date} required />
        <Input name="vendor" label="Vendor" defaultValue={expense?.vendor ?? ""} />
        <Input name="payment_method" label="Payment Method" defaultValue={expense?.payment_method ?? ""} />
        <SelectField name="status" label="Status" defaultValue={expense?.status ?? "recorded"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="receipt_url"
        label="Receipt / Document"
        bucket="receipts"
        folder="expenses"
        defaultValue={expense?.receipt_url}
        kind="document"
      />
      <Textarea name="description" label="Description" rows={2} defaultValue={expense?.description ?? ""} />
      <Button type="submit" loading={pending}>{expense ? "Update Expense" : "Add Expense"}</Button>
    </form>
  );
}

export default function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track business expenses."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Expense"}
          </Button>
        }
      />
      <AdminCard className="mb-6">
        <p className="text-sm text-slate-500">Total Expenses</p>
        <p className="text-2xl font-bold text-navy">${total.toFixed(2)}</p>
      </AdminCard>
      {showAdd && (
        <AdminCard title="Add Expense" className="mb-6">
          <ExpenseForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Expenses (${expenses.length})`}>
        {expenses.length === 0 ? (
          <EmptyState title="No expenses yet" />
        ) : (
          <div className="space-y-4">
            {expenses.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy">{e.name}</h4>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-sm text-slate-600">{e.category} · {e.vendor}</p>
                    <p className="text-lg font-bold text-navy">{e.currency} {e.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{e.expense_date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === e.id ? null : e.id)}>
                      {editingId === e.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteExpense(e.id)} />
                  </div>
                </div>
                {editingId === e.id && (
                  <div className="mt-4 border-t pt-4">
                    <ExpenseForm expense={e} onDone={() => setEditingId(null)} />
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
