import { createClient } from "@/src/lib/supabase/server";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("full_name");

  return <EmployeesClient employees={employees ?? []} />;
}
