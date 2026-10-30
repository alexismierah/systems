
import LoginForm from "@/components/auth/LoginForm";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12">
        <LoginForm />
      </section>

      <section className="relative hidden flex-col justify-between overflow-hidden bg-green-950 p-12 text-white lg:flex">
        <div className="relative flex items-center gap-3">
          <Wallet size={27} />
          <span className="text-lg font-bold">
            Liquidation System
          </span>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-green-300">
            Financial Management
          </p>

          <h2 className="text-5xl font-bold leading-tight">
            Keep your finances organized.
          </h2>

          <p className="mt-6 leading-7 text-green-100/70">
            Manage liquidation records, monitor expenses,
            and keep your financial transactions in one place.
          </p>
        </div>

        <p className="text-xs text-green-100/50">
          © 2026 Liquidation System
        </p>
      </section>
    </main>
  );
}
