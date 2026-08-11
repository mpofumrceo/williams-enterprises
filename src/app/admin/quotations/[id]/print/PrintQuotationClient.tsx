"use client";

import type { Quotation, QuotationItem } from "@/src/types/database";
import { Button } from "@/src/components/ui/Button";

export default function PrintQuotationClient({
  quotation,
  items,
}: {
  quotation: Quotation;
  items: QuotationItem[];
}) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-8 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-navy">Quotation Preview</h1>
        <Button onClick={() => window.print()}>Print</Button>
      </div>

      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-navy">Williams Enterprises</h2>
        <p className="text-sm text-slate-600">Building Today, Transforming Tomorrow</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold text-navy">Bill To</h3>
          <p className="font-medium">{quotation.client_name}</p>
          {quotation.client_address && <p className="text-sm text-slate-600">{quotation.client_address}</p>}
          {quotation.client_email && <p className="text-sm">{quotation.client_email}</p>}
          {quotation.client_phone && <p className="text-sm">{quotation.client_phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-navy">{quotation.quote_number}</p>
          <p className="text-sm text-slate-600">Date: {quotation.quote_date}</p>
          {quotation.expiry_date && <p className="text-sm text-slate-600">Expires: {quotation.expiry_date}</p>}
          <p className="mt-1 text-sm capitalize text-slate-500">Status: {quotation.status}</p>
        </div>
      </div>

      {quotation.project_name && (
        <div className="mt-6">
          <h3 className="font-semibold text-navy">Project</h3>
          <p>{quotation.project_name}</p>
          {quotation.project_location && <p className="text-sm text-slate-600">{quotation.project_location}</p>}
        </div>
      )}

      {quotation.description && (
        <p className="mt-4 text-sm text-slate-700">{quotation.description}</p>
      )}

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="pb-2">Description</th>
            <th className="pb-2 text-right">Qty</th>
            <th className="pb-2 text-right">Unit</th>
            <th className="pb-2 text-right">Price</th>
            <th className="pb-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{item.unit}</td>
              <td className="py-2 text-right">${item.unit_price.toFixed(2)}</td>
              <td className="py-2 text-right">${(item.quantity * item.unit_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><span>Labour</span><span>${quotation.labour_total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Materials</span><span>${quotation.materials_total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Equipment</span><span>${quotation.equipment_total.toFixed(2)}</span></div>
        <div className="flex justify-between border-t pt-1"><span>Subtotal</span><span>${quotation.subtotal.toFixed(2)}</span></div>
        {quotation.discount > 0 && (
          <div className="flex justify-between text-red-600"><span>Discount</span><span>-${quotation.discount.toFixed(2)}</span></div>
        )}
        {quotation.tax_rate > 0 && (
          <div className="flex justify-between"><span>Tax ({quotation.tax_rate}%)</span><span>${quotation.tax_amount.toFixed(2)}</span></div>
        )}
        <div className="flex justify-between border-t pt-2 text-lg font-bold text-navy">
          <span>Total</span><span>${quotation.total.toFixed(2)}</span>
        </div>
      </div>

      {quotation.payment_terms && (
        <div className="mt-8">
          <h3 className="font-semibold text-navy">Payment Terms</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quotation.payment_terms}</p>
        </div>
      )}

      {quotation.terms_and_conditions && (
        <div className="mt-4">
          <h3 className="font-semibold text-navy">Terms & Conditions</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quotation.terms_and_conditions}</p>
        </div>
      )}

      {quotation.notes && (
        <div className="mt-4">
          <h3 className="font-semibold text-navy">Notes</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}
    </div>
  );
}
