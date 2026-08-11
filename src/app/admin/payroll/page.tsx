import { createClient } from "@/src/lib/supabase/server";
import PayrollClient from "./PayrollClient";

export default async function PayrollPage() {
  const supabase = await createClient();
  const [{ data: records }, { data: employees }] = await Promise.all([
    supabase
      .from("payroll_records")
      .select("*, employees(full_name)")
      .order("pay_period_start", { ascending: false }),
    supabase.from("employees").select("*").eq("status", "active").order("full_name"),
  ]);

  return <PayrollClient records={records ?? []} employees={employees ?? []} />;
}
