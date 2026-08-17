"use client";

import Link from "next/link";
import {
  Package,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your inventory and quotations.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/dashboard/inventory"
          className="group rounded-xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-gray-100 p-3">
              <Package className="h-6 w-6" />
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Inventory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage products, stock quantities, pricing, and
            categories.
          </p>
        </Link>

        <Link
          href="/dashboard/quotations"
          className="group rounded-xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-gray-100 p-3">
              <FileText className="h-6 w-6" />
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Quotations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and track customer quotations.
          </p>
        </Link>
      </div>
    </div>
  );
}