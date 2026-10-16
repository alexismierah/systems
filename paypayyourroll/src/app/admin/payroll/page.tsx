import PageHeading from "@/components/page-heading";

export default function PayrollPage() {
  return (
    <>
      <PageHeading
        title="Payroll Management"
        description="Manage payroll periods, salary records, deductions, and payslips."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Current Payroll", value: "Not configured" },
          { label: "Employees to Pay", value: "Not available" },
          { label: "Total Net Payroll", value: "Not calculated" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Payroll Records</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Payroll records will appear here once the payroll database and
          salary calculation rules are configured.
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">No payroll records yet</p>
          <p className="mt-2 text-sm text-slate-500">
            The next step is to set up pay periods, employee salary details,
            allowances, deductions, and net pay calculations.
          </p>
        </div>
      </section>
    </>
  );
}