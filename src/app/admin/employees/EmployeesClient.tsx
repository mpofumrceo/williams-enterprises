"use client";

import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Employee } from "@/src/types/database";
import { createEmployee, updateEmployee, deleteEmployee } from "@/src/lib/actions/admin";
import { AdminCard, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import MediaUpload from "@/src/components/admin/MediaUpload";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

function EmployeeForm({ employee, onDone }: { employee?: Employee; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = employee
        ? await updateEmployee(employee.id, formData)
        : await createEmployee(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(employee ? "Employee updated" : "Employee created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="employee_id" label="Employee ID" defaultValue={employee?.employee_id ?? ""} />
        <Input name="full_name" label="Full Name" defaultValue={employee?.full_name} required />
        <Input name="position" label="Position" defaultValue={employee?.position ?? ""} />
        <Input name="department" label="Department" defaultValue={employee?.department ?? ""} />
        <Input name="email" label="Email" type="email" defaultValue={employee?.email ?? ""} />
        <Input name="phone" label="Phone" defaultValue={employee?.phone ?? ""} />
        <Input name="employment_date" label="Employment Date" type="date" defaultValue={employee?.employment_date ?? ""} />
        <Input name="salary" label="Salary" type="number" step="0.01" defaultValue={employee?.salary ?? ""} />
        <SelectField name="status" label="Status" defaultValue={employee?.status ?? "active"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="profile_image_url"
        label="Profile Photo"
        bucket="employees"
        folder="profiles"
        defaultValue={employee?.profile_image_url}
        kind="image"
      />
      <Textarea name="notes" label="Notes" rows={2} defaultValue={employee?.notes ?? ""} />
      <Button type="submit" loading={pending}>{employee ? "Update Employee" : "Add Employee"}</Button>
    </form>
  );
}

export default function EmployeesClient({ employees }: { employees: Employee[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage employee records."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Employee"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add Employee" className="mb-6">
          <EmployeeForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`Employees (${employees.length})`}>
        {employees.length === 0 ? (
          <EmptyState title="No employees yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Position</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <Fragment key={e.id}>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{e.full_name}</p>
                        <p className="text-xs text-slate-400">{e.employee_id}</p>
                      </td>
                      <td className="py-3 pr-4">{e.position ?? "—"}</td>
                      <td className="py-3 pr-4">{e.department ?? "—"}</td>
                      <td className="py-3 pr-4"><StatusBadge status={e.status} /></td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === e.id ? null : e.id)}>
                            {editingId === e.id ? "Cancel" : "Edit"}
                          </Button>
                          <DeleteButton onDelete={() => deleteEmployee(e.id)} />
                        </div>
                      </td>
                    </tr>
                    {editingId === e.id && (
                      <tr>
                        <td colSpan={5} className="py-4">
                          <EmployeeForm employee={e} onDone={() => setEditingId(null)} />
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
