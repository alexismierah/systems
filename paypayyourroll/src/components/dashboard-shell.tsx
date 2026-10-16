import Link from "next/link";
import type { ReactNode } from "react";

type DashboardShellProps = {
  role: "admin" | "employee";
  name: string;
  children: ReactNode;
};

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
  { label: "Employees", href: "/admin/employees", icon: "♙" },
  { label: "Payroll", href: "/admin/payroll", icon: "₱" },
  { label: "Attendance", href: "/admin/attendance", icon: "◷" },
  { label: "Reports", href: "/admin/reports", icon: "▤" },
];

const employeeLinks = [
  { label: "Dashboard", href: "/employee/dashboard", icon: "▦" },
  { label: "My Profile", href: "/employee/profile", icon: "♙" },
  { label: "My Payslips", href: "/employee/payslips", icon: "₱" },
  { label: "My Attendance", href: "/employee/attendance", icon: "◷" },
  { label: "My Leave", href: "/employee/leave", icon: "▤" },
];

export default function DashboardShell({
  role,
  name,
  children,
}: DashboardShellProps) {
  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="flex w-full flex-col bg-slate-950 text-white md:fixed md:inset-y-0 md:w-64">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href={`/${role}/dashboard`} className="text-xl font-bold">
            PayPay<span className="text-blue-400">YourRoll</span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
            {role === "admin" ? "Admin Portal" : "Employee Portal"}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span className="w-5 text-center text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-5 md:block">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs capitalize text-slate-400">{role}</p>

          <form action="/auth/signout" method="POST" className="mt-4">
            <button
              type="submit"
              className="w-full rounded-lg border border-white/15 px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 md:ml-64">
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm text-slate-500">PayPayYourRoll</p>
            <p className="mt-1 font-semibold text-slate-800">
              {role === "admin" ? "Administration" : "Employee Workspace"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-slate-800">
                {name}
              </p>
              <p className="text-xs capitalize text-slate-500">{role}</p>
            </div>
          </div>
        </div>

        {children}

        <footer className="mt-12 border-t border-slate-200 pt-5 text-xs text-slate-400">
          © {new Date().getFullYear()} PayPayYourRoll
        </footer>
      </main>
    </div>
  );
}