import Link from "next/link";
import PageHeading from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "employee");

  const stats = [
    {
      label: "Total Employees",
      value: error ? "Unavailable" : String(count ?? 0),
      note: "Registered employee accounts",
    },
    {
      label: "Payroll",
      value: "Not configured",
      note: "Connect payroll records",
    },
    {
      label: "Attendance",
      value: "Not configured",
      note: "Connect attendance records",
    },
    {
      label: "Reports",
      value: "Available soon",
      note: "Based on saved records",
    },
  ];

  const shortcuts = [
    {
      title: "Manage Employees",
      description: "View employee accounts and their assigned roles.",
      href: "/admin/employees",
    },
    {
      title: "Manage Payroll",
      description: "Prepare payroll periods and salary records.",
      href: "/admin/payroll",
    },
    {
      title: "Review Attendance",
      description: "Check attendance records and work hours.",
      href: "/admin/attendance",
    },
    {
      title: "View Reports",
      description: "Prepare payroll and attendance summaries.",
      href: "/admin/reports",
    },
  ];

  return (
    <>
      <PageHeading
        title="Admin Dashboard"
        description="Overview of your employee and payroll management system."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 break-words text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Administration
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {item.title}
                </h3>
                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}