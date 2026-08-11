"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Quotation, QuotationItem } from "@/src/types/database";
import { createQuotation, deleteQuotation, duplicateQuotation } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { Copy, Printer } from "lucide-react";

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  item_type: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const emptyItem = (): LineItem => ({
  description: "",
  quantity: 1,
  unit: "ea",
  unit_price: 0,
  item_type: "other",
});

function calcTotals(items: LineItem[], labour: number, materials: number, equipment: number, discount: number, taxRate: number) {
  const itemsTotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const subtotal = labour + materials + equipment + itemsTotal;
  const afterDiscount = subtotal - discount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, taxAmount, total };
}

function QuotationForm({ onDone }: { onDone?: () => void }) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [labour, setLabour] = useState(0);
  const [materials, setMaterials] = useState(0);
  const [equipment, setEquipment] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  const totals = calcTotals(items, labour, materials, equipment, discount, taxRate);

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function handleSubmit(formData: FormData) {
    formData.set("items", JSON.stringify(items.filter((i) => i.description.trim())));
    formData.set("labour_total", String(labour));
    formData.set("materials_total", String(materials));
    formData.set("equipment_total", String(equipment));
    formData.set("discount", String(discount));
    formData.set("tax_rate", String(taxRate));

    startTransition(async () => {
      const res = await createQuotation(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Quotation created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="client_name" label="Client Name" required />
        <Input name="client_email" label="Client Email" type="email" />
        <Input name="client_phone" label="Client Phone" />
        <Input name="project_name" label="Project Name" />
        <Input name="quote_date" label="Quote Date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        <Input name="expiry_date" label="Expiry Date" type="date" />
        <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} />
      </div>
      <Textarea name="client_address" label="Client Address" rows={2} />
      <Input name="project_location" label="Project Location" />
      <Textarea name="description" label="Description" rows={2} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-semibold text-navy">Line Items</h4>
          <Button type="button" variant="outline" size="sm" onClick={() => setItems((p) => [...p, emptyItem()])}>
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-6">
              <input
                className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Unit"
                value={item.unit}
                onChange={(e) => updateItem(idx, "unit", e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                type="number"
                step="0.01"
                placeholder="Price"
                value={item.unit_price}
                onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
              />
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 rounded-lg border px-2 py-2 text-sm"
                  value={item.item_type}
                  onChange={(e) => updateItem(idx, "item_type", e.target.value)}
                >
                  <option value="labour">Labour</option>
                  <option value="material">Material</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input name="labour_total_display" label="Labour Total" type="number" step="0.01" value={labour} onChange={(e) => setLabour(parseFloat(e.target.value) || 0)} />
        <Input name="materials_total_display" label="Materials Total" type="number" step="0.01" value={materials} onChange={(e) => setMaterials(parseFloat(e.target.value) || 0)} />
        <Input name="equipment_total_display" label="Equipment Total" type="number" step="0.01" value={equipment} onChange={(e) => setEquipment(parseFloat(e.target.value) || 0)} />
        <Input name="discount_display" label="Discount" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
        <Input name="tax_rate_display" label="Tax Rate (%)" type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
      </div>

      <AdminCard className="bg-slate-50">
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <p>Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong></p>
          <p>Tax: <strong>${totals.taxAmount.toFixed(2)}</strong></p>
          <p className="text-lg">Total: <strong className="text-navy">${totals.total.toFixed(2)}</strong></p>
        </div>
      </AdminCard>

      <Textarea name="terms_and_conditions" label="Terms & Conditions" rows={3} />
      <Textarea name="payment_terms" label="Payment Terms" rows={2} />
      <Textarea name="notes" label="Notes" rows={2} />
      <Button type="submit" loading={pending}>Create Quotation</Button>
    </form>
  );
}

function DuplicateButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await duplicateQuotation(id);
          if (res.error) toast.error(res.error);
          else toast.success("Quotation duplicated");
        })
      }
    >
      <Copy className="h-4 w-4" /> Duplicate
    </Button>
  );
}

type QuoteWithItems = Quotation & { quotation_items?: QuotationItem[] };

export default function QuotationsClient({ quotations }: { quotations: QuoteWithItems[] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Create and manage client quotations."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Quotation"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="New Quotation" className="mb-6">
          <QuotationForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Quotations (${quotations.length})`}>
        {quotations.length === 0 ? (
          <EmptyState title="No quotations yet" />
        ) : (
          <div className="space-y-4">
            {quotations.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy">{q.quote_number}</h4>
                      <StatusBadge status={q.status} />
                    </div>
                    <p className="text-sm text-slate-600">{q.client_name} · {q.project_name}</p>
                    <p className="text-lg font-bold text-navy">${q.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">
                      {q.quote_date} · {q.quotation_items?.length ?? 0} line items
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/quotations/${q.id}/print`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" /> Print
                      </Button>
                    </Link>
                    <DuplicateButton id={q.id} />
                    <DeleteButton onDelete={() => deleteQuotation(q.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
