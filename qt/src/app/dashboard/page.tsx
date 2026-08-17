"use client";

import {
  Package,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Welcome to your quotation management system.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/dashboard/inventory"
          className="group rounded-xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-gray-100 p-3">
              <Package className="h-5 w-5" />
            </div>

            <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:text-gray-900" />
          </div>

          <h2 className="mt-5 font-semibold">
            Inventory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your products and stock.
          </p>
        </Link>

        <Link
          href="/dashboard/quotations"
          className="group rounded-xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-gray-100 p-3">
              <FileText className="h-5 w-5" />
            </div>

            <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:text-gray-900" />
          </div>

          <h2 className="mt-5 font-semibold">
            Quotations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage customer quotations.
          </p>
        </Link>
      </div>
    </div>
  );
}