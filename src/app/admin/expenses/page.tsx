import { createClient } from "@/src/lib/supabase/server";
import ExpensesClient from "./ExpensesClient";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  return <ExpensesClient expenses={expenses ?? []} />;
}
