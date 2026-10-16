
import PageHeading from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const fields = [
    ["Full Name", profile?.full_name || "Not provided"],
    ["Employee ID", profile?.employee_id || "Not assigned"],
    ["Email", user.email || "Not available"],
    ["Account Role", profile?.role || "Employee"],
  ];

  return (
    <>
      <PageHeading
        title="My Profile"
        description="View your account information."
      />

      <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        {fields.map(([label, value]) => (
          <div key={label} className="border-b border-slate-100 py-4 last:border-0">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </section>
    </>
  );
}
