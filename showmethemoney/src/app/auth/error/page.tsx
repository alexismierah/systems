
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Unable to verify your account
        </h1>
        <p className="mt-3 leading-6 text-slate-500">
          Your account profile may be missing or your authentication link may
          have expired. Contact your administrator for assistance.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
}
