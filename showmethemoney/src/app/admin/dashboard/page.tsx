
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect(
      profile?.role === "employee" ? "/employee/dashboard" : "/auth/error"
    );
  }

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "employee");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-700 p-2 text-white">
              <Wallet size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-900">ShowMeTheMoney</p>
              <p className="text-xs text-slate-500">Administration</p>
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
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            ADMINISTRATOR
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Welcome back, {profile.full_name || user.email || "Administrator"}.
          </p>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Employee accounts
              </p>
              <Users className="text-emerald-700" size={22} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {count ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Employee profiles in the system
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Payroll management
              </p>
              <Wallet className="text-emerald-700" size={22} />
            </div>
            <p className="mt-4 text-xl font-bold text-slate-900">
              Coming soon
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Payroll processing will be added in a future module.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                System access
              </p>
              <LayoutDashboard className="text-emerald-700" size={22} />
            </div>
            <p className="mt-4 text-xl font-bold text-slate-900">
              Administrator
            </p>
            <p className="mt-2 text-sm text-slate-500">
              You are signed in with administrator access.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">
            Quick actions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage employee profiles and review system accounts.
          </p>

          <Link
            href="/admin/employees"
            className="mt-6 flex max-w-md items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-800">
                <Users size={21} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Employee management
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  View employee accounts
                </p>
              </div>
            </div>
            <ArrowRight size={19} className="text-slate-400" />
          </Link>
        </section>
      </div>
    </main>
  );
}
