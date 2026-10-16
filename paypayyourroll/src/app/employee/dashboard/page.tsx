
import PageHeading from "@/components/page-heading";

export default function EmployeeDashboard() {
  const stats = [
    ["Latest Net Pay", "₱0.00"],
    ["Attendance This Month", "0 days"],
    ["Available Leave", "0 days"],
  ];

  return (
    <>
      <PageHeading
        title="My Dashboard"
        description="Your personal payroll and attendance overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <section
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-bold">{value}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Recent Updates</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your payroll and attendance updates will appear here.
        </p>
      </section>
    </>
  );
}
