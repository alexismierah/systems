import Link from "next/link";
import PageHeading from "@/components/page-heading";

const reports = [
  {
    title: "Employee Report",
    description:
      "Review registered employees, employee IDs, and account roles.",
    href: "/admin/employees",
    category: "Employee Records",
  },
  {
    title: "Payroll Report",
    description:
      "Review salary totals, deductions, net pay, and payroll periods.",
    href: "/admin/payroll",
    category: "Payroll",
  },
  {
    title: "Attendance Report",
    description:
      "Review attendance, work hours, late arrivals, and absences.",
    href: "/admin/attendance",
    category: "Attendance",
  },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeading
        title="Reports"
        description="Access employee, payroll, and attendance reporting."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {reports.map((report) => (
          <section
            key={report.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {report.category}
            </span>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {report.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {report.description}
            </p>

            <Link
              href={report.href}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Open section <span>→</span>
            </Link>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900">Export Reports</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          PDF and Excel exports can be added after the payroll and attendance
          records are connected. Reports should use saved database records
          rather than placeholder values.
        </p>
      </section>
    </>
  );
}