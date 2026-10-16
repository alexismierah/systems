
import PageHeading from "@/components/page-heading";

export default function MyPayslipsPage() {
  return (
    <>
      <PageHeading
        title="My Payslips"
        description="View your salary details and payslip history."
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Payslip History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your payslips will appear here when payroll records are available.
        </p>
      </section>
    </>
  );
}
