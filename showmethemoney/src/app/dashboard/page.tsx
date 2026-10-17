import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Wallet, LogOut, UserRound, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="sr-only">Loading dashboard…</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

async function DashboardPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect("/login");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  const fullName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
              <Wallet size={22} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                ShowMeTheMoney
              </h1>
              <p className="text-xs text-slate-500">Personal Finance</p>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-green-700">
            YOUR FINANCIAL SPACE
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {fullName}!
          </h2>

          <p className="mt-2 text-slate-500">
            You are signed in and ready to manage your finances.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <UserRound size={22} />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Account Information
            </h3>

            <p className="mt-2 break-all text-sm text-slate-500">
              {user.email}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Registered account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp size={22} />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Financial Overview
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your financial summary will appear here.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Coming soon
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Wallet size={22} />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Transactions
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Track your income and expenses here.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Coming soon
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}