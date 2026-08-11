"use client";

import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Employee, PayrollRecord } from "@/src/types/database";
import { createPayrollRecord, updatePayrollRecord, deletePayrollRecord } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

type PayrollWithEmployee = PayrollRecord & { employees?: { full_name: string } | null };

function PayrollForm({
  record,
  employees,
  onDone,
}: {
  record?: PayrollRecord;
  employees: Employee[];
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = record
        ? await updatePayrollRecord(record.id, formData)
        : await createPayrollRecord(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(record ? "Payroll updated" : "Payroll record created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="w-full">
          <label htmlFor="employee_id" className="mb-1.5 block text-sm font-medium text-slate-700">Employee</label>
          <select
            id="employee_id"
            name="employee_id"
            defaultValue={record?.employee_id}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        <SelectField name="payment_status" label="Payment Status" defaultValue={record?.payment_status ?? "pending"} options={PAYMENT_OPTIONS} />
        <Input name="pay_period_start" label="Period Start" type="date" defaultValue={record?.pay_period_start} required />
        <Input name="pay_period_end" label="Period End" type="date" defaultValue={record?.pay_period_end} required />
        <Input name="basic_salary" label="Basic Salary" type="number" step="0.01" defaultValue={record?.basic_salary ?? 0} required />
        <Input name="allowances" label="Allowances" type="number" step="0.01" defaultValue={record?.allowances ?? 0} />
        <Input name="bonuses" label="Bonuses" type="number" step="0.01" defaultValue={record?.bonuses ?? 0} />
        <Input name="deductions" label="Deductions" type="number" step="0.01" defaultValue={record?.deductions ?? 0} />
        <Input name="payment_date" label="Payment Date" type="date" defaultValue={record?.payment_date ?? ""} />
      </div>
      <Textarea name="notes" label="Notes" rows={2} defaultValue={record?.notes ?? ""} />
      <Button type="submit" loading={pending}>{record ? "Update Record" : "Create Record"}</Button>
    </form>
  );
}

export default function PayrollClient({
  records,
  employees,
}: {
  records: PayrollWithEmployee[];
  employees: Employee[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Manage employee payroll records."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Payroll Record"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add Payroll Record" className="mb-6">
          <PayrollForm employees={employees} onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Records (${records.length})`}>
        {records.length === 0 ? (
          <EmptyState title="No payroll records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Period</th>
                  <th className="pb-3 pr-4">Net Salary</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium">{r.employees?.full_name ?? r.employee_id.slice(0, 8)}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {r.pay_period_start} — {r.pay_period_end}
                      </td>
                      <td className="py-3 pr-4 font-semibold">${r.net_salary.toFixed(2)}</td>
                      <td className="py-3 pr-4"><StatusBadge status={r.payment_status} /></td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === r.id ? null : r.id)}>
                            {editingId === r.id ? "Cancel" : "Edit"}
                          </Button>
                          <DeleteButton onDelete={() => deletePayrollRecord(r.id)} />
                        </div>
                      </td>
                    </tr>
                    {editingId === r.id && (
                      <tr>
                        <td colSpan={5} className="py-4">
                          <PayrollForm record={r} employees={employees} onDone={() => setEditingId(null)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
