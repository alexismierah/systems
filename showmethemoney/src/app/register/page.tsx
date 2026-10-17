
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Wallet } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Wallet size={25} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Account access
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          ShowMeTheMoney accounts are created by an authorized administrator.
          Contact your administrator to request access.
        </p>

        <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={22} />
          <p className="text-sm leading-6 text-slate-600">
            Account access is assigned according to your role in the payroll
            system.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          <ArrowLeft size={18} />
          Back to login
        </Link>
      </section>
    </main>
  );
}
