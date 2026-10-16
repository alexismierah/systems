
import Link from "next/link";
import type { ReactNode } from "react";

type Role = "admin" | "employee";

type Props = {
  role: Role;
  name: string;
  children: ReactNode;
};

const menus = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Employees", href: "/admin/employees" },
    { label: "Payroll", href: "/admin/payroll" },
    { label: "Attendance", href: "/admin/attendance" },
    { label: "Reports", href: "/admin/reports" },
  ],
  employee: [
    { label: "Dashboard", href: "/employee/dashboard" },
    { label: "My Profile", href: "/employee/profile" },
    { label: "My Payslips", href: "/employee/payslips" },
    { label: "My Attendance", href: "/employee/attendance" },
    { label: "My Leave", href: "/employee/leave" },
  ],
};

export default function DashboardShell({
  role,
  name,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="border-b border-slate-100 px-6 py-5">
          <Link
            href={`/${role}/dashboard`}
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            PayPay<span className="text-blue-600">YourRoll</span>
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            {role === "admin" ? "Administrator Portal" : "Employee Portal"}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-col">
          {menus[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-5 md:px-8">
          <div>
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="font-semibold text-slate-900">{name}</p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
            {role}
          </span>
        </header>

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
