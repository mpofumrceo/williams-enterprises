"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import {
  Plus,
  Trash2,
  Download,
  MessageCircle,
  ShoppingCart,
  X,
} from "lucide-react";
import type { PosSale, PosSaleItem, Profile, Service } from "@/src/types/database";
import { createPosSale, deletePosSale } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

type LineItem = {
  item_type: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

type ServiceOption = Pick<Service, "id" | "name" | "pricing_info" | "short_description">;

function parsePrice(info: string | null) {
  if (!info) return 0;
  const match = info.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function money(n: number, currency = "USD") {
  return `${currency} ${n.toFixed(2)}`;
}

export default function PosClient({
  sales,
  itemsBySale,
  services,
  cashier,
}: {
  sales: PosSale[];
  itemsBySale: Record<string, PosSaleItem[]>;
  services: ServiceOption[];
  cashier: Profile;
}) {
  const [showSale, setShowSale] = useState(false);
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItem[]>([
    { item_type: "service", description: "", quantity: 1, unit: "unit", unit_price: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<{
    sale: PosSale;
    items: PosSaleItem[];
  } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const cashierName = cashier.full_name || cashier.email.split("@")[0];

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0),
    [items]
  );
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  function addItem() {
    setItems((prev) => [
      ...prev,
      { item_type: "service", description: "", quantity: 1, unit: "unit", unit_price: 0 },
    ]);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addServiceQuick(service: ServiceOption) {
    setItems((prev) => [
      ...prev,
      {
        item_type: "service",
        description: service.name,
        quantity: 1,
        unit: "job",
        unit_price: parsePrice(service.pricing_info),
      },
    ]);
    setShowSale(true);
  }

  function resetForm() {
    setItems([{ item_type: "service", description: "", quantity: 1, unit: "unit", unit_price: 0 }]);
    setDiscount(0);
    setTaxRate(0);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setPaymentMethod("cash");
    setNotes("");
  }

  function completeSale() {
    const valid = items.filter((i) => i.description.trim() && i.quantity > 0);
    if (!valid.length) {
      toast.error("Add at least one item with a description");
      return;
    }

    const fd = new FormData();
    fd.set("items", JSON.stringify(valid));
    fd.set("discount", String(discount));
    fd.set("tax_rate", String(taxRate));
    fd.set("currency", currency);
    fd.set("client_name", clientName);
    fd.set("client_phone", clientPhone);
    fd.set("client_email", clientEmail);
    fd.set("payment_method", paymentMethod);
    fd.set("notes", notes);

    startTransition(async () => {
      const res = await createPosSale(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Sale recorded — ${res.receipt_number}`);
      setShowSale(false);
      resetForm();
      // Soft refresh via reload so new sale appears
      window.location.reload();
    });
  }

  async function saveReceiptImage() {
    if (!receiptRef.current || !activeReceipt) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${activeReceipt.sale.receipt_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Receipt saved to your device");
    } catch {
      toast.error("Could not save receipt image");
    }
  }

  function sendWhatsApp() {
    if (!activeReceipt) return;
    const sale = activeReceipt.sale;
    const lines = activeReceipt.items
      .map(
        (i) =>
          `• ${i.description} (${i.quantity} ${i.unit ?? "unit"} × ${Number(i.unit_price).toFixed(2)}) = ${Number(i.line_total).toFixed(2)}`
      )
      .join("\n");

    const message = [
      `*Williams Enterprises — Receipt*`,
      `Receipt: ${sale.receipt_number}`,
      `Date: ${new Date(sale.sale_date).toLocaleString()}`,
      sale.client_name ? `Client: ${sale.client_name}` : null,
      "",
      lines,
      "",
      `Subtotal: ${money(Number(sale.subtotal), sale.currency)}`,
      Number(sale.discount) > 0 ? `Discount: -${money(Number(sale.discount), sale.currency)}` : null,
      Number(sale.tax_amount) > 0
        ? `Tax (${sale.tax_rate}%): ${money(Number(sale.tax_amount), sale.currency)}`
        : null,
      `*Total: ${money(Number(sale.total), sale.currency)}*`,
      `Payment: ${sale.payment_method}`,
      "",
      `Recorded by: ${sale.recorded_by_name || "Staff"}`,
      sale.recorded_by_email ? `(${sale.recorded_by_email})` : null,
      "",
      "Thank you for choosing Williams Enterprises.",
      "Building Today, Transforming Tomorrow",
    ]
      .filter(Boolean)
      .join("\n");

    const phone = (sale.client_phone || clientPhone || "").replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        description="Record construction sales, generate receipts, share on WhatsApp, or save to your device."
        actions={
          <Button onClick={() => setShowSale((v) => !v)}>
            {showSale ? "Cancel" : "New Sale"}
          </Button>
        }
      />

      <AdminCard className="mb-6">
        <p className="text-sm text-slate-500">Logged in cashier</p>
        <p className="text-lg font-semibold text-navy">{cashierName}</p>
        <p className="text-xs text-slate-400">{cashier.email} · Role: {cashier.role.replace("_", " ")}</p>
      </AdminCard>

      {services.length > 0 && (
        <AdminCard title="Quick add services" className="mb-6">
          <div className="flex flex-wrap gap-2">
            {services.slice(0, 12).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addServiceQuick(s)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-navy hover:border-amber-500 hover:bg-amber-50"
              >
                {s.name}
              </button>
            ))}
          </div>
        </AdminCard>
      )}

      {showSale && (
        <AdminCard title="New Sale" className="mb-6">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Recorded by: <strong>{cashierName}</strong> ({cashier.email})
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input
              label="Client WhatsApp / Phone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+263..."
            />
            <Input
              label="Client Email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="ecoCash">EcoCash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-navy">Line Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} /> Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-12">
                <select
                  value={item.item_type}
                  onChange={(e) => updateItem(index, { item_type: e.target.value })}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm md:col-span-2"
                >
                  <option value="service">Service</option>
                  <option value="material">Material</option>
                  <option value="labour">Labour</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="Description"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-4"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-1"
                  placeholder="Qty"
                />
                <input
                  value={item.unit}
                  onChange={(e) => updateItem(index, { unit: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-1"
                  placeholder="Unit"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                  placeholder="Price"
                />
                <div className="flex items-center justify-between gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-navy">
                    {(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input
              label="Discount"
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Tax %"
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
              >
                <option value="USD">USD</option>
                <option value="ZiG">ZiG</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4"
          />

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal, currency)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{money(discount, currency)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{money(taxAmount, currency)}</span></div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold text-navy">
              <span>Total</span><span>{money(total, currency)}</span>
            </div>
          </div>

          <Button className="mt-4" loading={pending} onClick={completeSale}>
            <ShoppingCart size={16} /> Complete Sale & Generate Receipt
          </Button>
        </AdminCard>
      )}

      <AdminCard title={`Recent Sales (${sales.length})`}>
        {sales.length === 0 ? (
          <EmptyState title="No sales yet" description="Create your first sale to generate a receipt." />
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-navy">{sale.receipt_number}</p>
                  <p className="text-sm text-slate-600">
                    {sale.client_name || "Walk-in client"} · {money(Number(sale.total), sale.currency)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(sale.sale_date).toLocaleString()} · Recorded by{" "}
                    {sale.recorded_by_name || "—"}
                    {sale.recorded_by_email ? ` (${sale.recorded_by_email})` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setActiveReceipt({
                        sale,
                        items: itemsBySale[sale.id] ?? [],
                      })
                    }
                  >
                    Receipt
                  </Button>
                  <DeleteButton onDelete={() => deletePosSale(sale.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Receipt modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
              <h3 className="font-semibold text-navy">Receipt</h3>
              <button type="button" onClick={() => setActiveReceipt(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div ref={receiptRef} className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">
                <div className="border-b border-dashed border-slate-300 pb-4 text-center">
                  <h2 className="text-xl font-bold text-[#0A2540]">Williams Enterprises</h2>
                  <p className="text-xs text-amber-700">Building Today, Transforming Tomorrow</p>
                  <p className="mt-2 text-sm font-semibold">{activeReceipt.sale.receipt_number}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(activeReceipt.sale.sale_date).toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  {activeReceipt.sale.client_name && (
                    <p><span className="text-slate-500">Client:</span> {activeReceipt.sale.client_name}</p>
                  )}
                  {activeReceipt.sale.client_phone && (
                    <p><span className="text-slate-500">Phone:</span> {activeReceipt.sale.client_phone}</p>
                  )}
                  <p><span className="text-slate-500">Payment:</span> {activeReceipt.sale.payment_method}</p>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  {activeReceipt.items.map((item) => (
                    <div key={item.id} className="mb-2 flex justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-slate-500">
                          {item.quantity} {item.unit} × {Number(item.unit_price).toFixed(2)} · {item.item_type}
                        </p>
                      </div>
                      <p className="font-medium">{Number(item.line_total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-dashed border-slate-300 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(Number(activeReceipt.sale.subtotal), activeReceipt.sale.currency)}</span>
                  </div>
                  {Number(activeReceipt.sale.discount) > 0 && (
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>-{money(Number(activeReceipt.sale.discount), activeReceipt.sale.currency)}</span>
                    </div>
                  )}
                  {Number(activeReceipt.sale.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({activeReceipt.sale.tax_rate}%)</span>
                      <span>{money(Number(activeReceipt.sale.tax_amount), activeReceipt.sale.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#0A2540]">
                    <span>TOTAL</span>
                    <span>{money(Number(activeReceipt.sale.total), activeReceipt.sale.currency)}</span>
                  </div>
                </div>

                {activeReceipt.sale.notes && (
                  <p className="mt-3 text-xs text-slate-500">Notes: {activeReceipt.sale.notes}</p>
                )}

                <div className="mt-6 border-t border-slate-200 pt-3 text-center text-xs text-slate-600">
                  <p>
                    Recorded by: <strong>{activeReceipt.sale.recorded_by_name}</strong>
                  </p>
                  <p>{activeReceipt.sale.recorded_by_email}</p>
                  <p className="mt-2">Thank you for your business</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={sendWhatsApp} className="flex-1">
                  <MessageCircle size={16} /> Send WhatsApp
                </Button>
                <Button variant="secondary" onClick={saveReceiptImage} className="flex-1">
                  <Download size={16} /> Save to Device
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                Tip: Save the image first, then attach it in WhatsApp if needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
