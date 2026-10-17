
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ManageEmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect(
      profile?.role === "employee" ? "/employee/dashboard" : "/auth/error"
    );
  }

  const { data: employees, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "employee")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Employee Management
          </h1>
          <p className="mt-2 text-slate-500">
            View employee accounts registered in the system.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Users size={23} className="text-emerald-700" />
            <h2 className="font-semibold text-slate-900">
              Employee Accounts
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {employees?.length ?? 0}
            </span>
          </div>

          {error ? (
            <p className="mt-6 text-sm text-red-600">
              Unable to load employee accounts. Check your Supabase policies
              and database configuration.
            </p>
          ) : !employees?.length ? (
            <div className="py-12 text-center">
              <UserRound
                size={32}
                className="mx-auto text-slate-300"
              />
              <p className="mt-3 font-medium text-slate-700">
                No employee accounts found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create employee accounts through Supabase Authentication.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {employee.full_name || "Unnamed employee"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Added{" "}
                      {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Employee
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
