
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={30} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-700 p-3 text-white">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold">
              Liquidation System
            </h1>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            <LogOut size={17} />
            Log Out
          </button>
        </header>

        <section className="mt-10 rounded-xl border border-gray-100 bg-white p-8">
          <p className="text-sm text-gray-500">
            Dashboard Overview
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome!
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            You are logged in as {email}.
          </p>

          <div className="mt-8 rounded-lg bg-green-50 p-5">
            <p className="font-semibold text-green-800">
              Your account is ready.
            </p>
            <p className="mt-1 text-sm text-green-700">
              Liquidation management modules will be added here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
