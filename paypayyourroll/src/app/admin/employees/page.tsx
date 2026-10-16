import PageHeading from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const { data: employees, error } = await supabase
    .from("profiles")
    .select("id, employee_id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeading
        title="Employee Management"
        description="View registered accounts and their employee information."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {error ? "Unable to retrieve employee records." : `${employees?.length ?? 0} account(s) found`}
          </p>
        </div>
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Accounts are created through the registration process.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load employee records. Check your Supabase table and
            Row Level Security policies.
          </div>
        ) : !employees?.length ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold text-slate-900">
              No employee accounts found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Employee accounts will appear here after they are registered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Employee ID</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Date Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {employee.full_name || "Unnamed employee"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {employee.id}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {employee.employee_id || "Not assigned"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          employee.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {employee.created_at
                        ? new Date(employee.created_at).toLocaleDateString(
                            "en-PH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "Not available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        For security, assign administrator roles only through a trusted
        server-side process or the Supabase SQL Editor. Do not let users
        change their own roles.
      </p>
    </>
  );
}