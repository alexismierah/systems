"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hanken_Grotesk } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Folder,
  ArrowRight,
  Loader2,
} from "lucide-react";

const font = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const money = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n || 0);

const numberFormat = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Amount with a muted currency symbol, like "₱ 12,580.45" */
function Amount({
  value,
  className = "",
  symbolClass = "",
}: {
  value: number;
  className?: string;
  symbolClass?: string;
}) {
  const negative = value < 0;

  return (
    <span className={className}>
      {negative && "-"}
      <span className={`mr-1.5 font-normal text-[#b5b8be] ${symbolClass}`}>
        ₱
      </span>
      {numberFormat.format(Math.abs(value || 0))}
    </span>
  );
}

type Category = {
  id: string;
  name: string;
};

type RecentTransaction = {
  id: string;
  particulars: string;
  transaction_date: string;
  cash_in: number | string | null;
  cash_out: number | string | null;
  categories?: { name: string } | null;
};

const cardClass =
  "min-w-0 rounded-[20px] border border-[#e7e8ea] bg-white p-6";

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("User");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [
        { data: profile },
        { data: categoryData },
        { data: transactionData },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("categories")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select("*, categories(name)")
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      const cats = categoryData || [];
      const records = transactionData || [];

      setName(profile?.full_name || "User");
      setCategories(cats);
      setTransactions(records.slice(0, 6));

      setTotalIn(
        records.reduce((sum, item) => sum + Number(item.cash_in || 0), 0)
      );

      setTotalOut(
        records.reduce((sum, item) => sum + Number(item.cash_out || 0), 0)
      );

      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  const viewAllClass =
    "shrink-0 rounded-lg border border-[#e7e8ea] bg-white px-3.5 py-1.5 text-[13px] font-medium transition hover:bg-[#f7f7f8]";

  return (
    <AppShell title="Dashboard" description="Your financial overview">
      <div className={`${font.className} text-[#1f1f1f] antialiased`}>
        {/* Page header */}
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b6f76]">
          Dashboard
        </p>

        <h1 className="mt-4 text-[34px] font-medium leading-tight tracking-[-0.025em] sm:text-[44px]">
          Welcome back, {name}!
        </h1>
        <p className="mt-3 text-[15px] text-[#6b6f76]">
          Here&apos;s an overview of your liquidation activities.
        </p>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto animate-spin text-[#262626]" />
            <p className="mt-3 text-sm text-[#8b8f96]">Loading dashboard...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2 min-[1360px]:grid-cols-[1.25fr_1fr_0.8fr]">
            {/* ---------- Total Balance ---------- */}
            <section
              className={`${cardClass} min-[1360px]:col-start-1 min-[1360px]:row-start-1`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#6b6f76]">Total Balance</p>
                  <Amount
                    value={totalIn - totalOut}
                    className="mt-3 block truncate text-[38px] font-semibold leading-none tracking-[-0.02em]"
                    symbolClass="text-[30px]"
                  />
                </div>

                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#262626] text-white">
                  <Wallet size={22} />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dff3e5] text-[#3f9e5f]">
                      <TrendingUp size={16} />
                    </div>
                    <span className="truncate text-[15px] text-[#4a4e55]">
                      Total Cash In
                    </span>
                  </div>
                  <Amount
                    value={totalIn}
                    className="shrink-0 text-[15px] font-semibold"
                    symbolClass="text-[13px]"
                  />
                </div>

                <div className="my-5 h-px bg-[#ececef]" />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde8e4] text-[#e5533d]">
                      <TrendingDown size={16} />
                    </div>
                    <span className="truncate text-[15px] text-[#4a4e55]">
                      Total Cash Out
                    </span>
                  </div>
                  <Amount
                    value={totalOut}
                    className="shrink-0 text-[15px] font-semibold"
                    symbolClass="text-[13px]"
                  />
                </div>
              </div>
            </section>

            {/* ---------- Total Categories ---------- */}
            <section
              className={`${cardClass} min-[1360px]:col-start-1 min-[1360px]:row-start-2`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#6b6f76]">Total Categories</p>
                  <p className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.02em]">
                    {categories.length}
                  </p>
                </div>

                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#d9922f]">
                  <Folder size={22} />
                </div>
              </div>
            </section>

            {/* ---------- Recent Transactions (tall) ---------- */}
            <section
              className={`${cardClass} min-[1360px]:col-start-2 min-[1360px]:row-span-2 min-[1360px]:row-start-1`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] text-[#6b6f76]">
                    Recent Transactions
                  </h2>
                  <p className="mt-1 text-xs text-[#8b8f96]">
                    Your latest liquidation entries
                  </p>
                </div>

                <Link href="/categories" className={viewAllClass}>
                  View All
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#8b8f96]">
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="mt-5">
                  {transactions.map((record) => {
                    const isIn = Number(record.cash_in) > 0;

                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between gap-3 border-t border-[#ececef] py-4 first:border-t-0"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              isIn
                                ? "bg-[#dff3e5] text-[#3f9e5f]"
                                : "bg-[#fde8e4] text-[#e5533d]"
                            }`}
                          >
                            {isIn ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold leading-tight">
                              {record.particulars}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#8b8f96]">
                              {record.categories?.name || "Category"} ·{" "}
                              {record.transaction_date}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-[14px] font-semibold ${
                            isIn ? "text-[#3f9e5f]" : "text-[#e5533d]"
                          }`}
                        >
                          {isIn ? "+" : "-"}
                          {money(
                            isIn
                              ? Number(record.cash_in)
                              : Number(record.cash_out)
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ---------- My Categories (tall) ---------- */}
            <section
              className={`${cardClass} min-[1360px]:col-start-3 min-[1360px]:row-span-2 min-[1360px]:row-start-1`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] text-[#6b6f76]">My Categories</h2>
                  <p className="mt-1 text-xs text-[#8b8f96]">
                    Your created categories
                  </p>
                </div>

                <Link href="/categories" className={viewAllClass}>
                  View All
                </Link>
              </div>

              {categories.length === 0 ? (
                <div className="py-16 text-center">
                  <Folder className="mx-auto text-[#c9cbd0]" size={30} />
                  <p className="mt-3 text-sm text-[#6b6f76]">
                    No categories yet.
                  </p>
                  <Link
                    href="/categories"
                    className="mt-3 inline-block text-sm font-semibold hover:underline"
                  >
                    Create Category
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className="group flex items-center justify-between gap-3 border-t border-[#ececef] py-4 first:border-t-0"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#5fc17e]" />
                        <span className="truncate text-[14px] font-semibold">
                          {category.name}
                        </span>
                      </div>

                      <ArrowRight
                        size={16}
                        className="shrink-0 text-[#8b8f96] transition group-hover:translate-x-0.5 group-hover:text-[#1f1f1f]"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}