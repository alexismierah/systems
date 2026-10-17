
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, LogOut, UserRound, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "employee") {
    redirect(
      profile?.role === "admin" ? "/admin/dashboard" : "/auth/error"
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/employee/dashboard"
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-emerald-700 p-2 text-white">
              <Wallet size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                ShowMeTheMoney
              </p>
              <p className="text-xs text-slate-500">Employee Portal</p>
            </div>
          </Link>

          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <LogOut size={17} />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-sm font-semibold text-emerald-700">
          EMPLOYEE PORTAL
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          My Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          Welcome back, {profile.full_name || user.email || "Employee"}.
        </p>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <UserRound size={23} />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              My Account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              View your account information.
            </p>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-400">Full name</p>
                <p className="mt-1 font-medium text-slate-800">
                  {profile.full_name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="mt-1 break-all font-medium text-slate-800">
                  {user.email || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Account role</p>
                <p className="mt-1 font-medium capitalize text-slate-800">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <FileText size={23} />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              My Payslips
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your payroll records will appear here once the payslip module
              is connected.
            </p>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No payslips available yet.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
