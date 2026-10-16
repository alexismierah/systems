import PageHeading from "@/components/page-heading";

export default function AttendancePage() {
  return (
    <>
      <PageHeading
        title="Attendance Management"
        description="Monitor employee time records, working hours, and attendance."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Present Today", value: "Not available" },
          { label: "Late Arrivals", value: "Not available" },
          { label: "Absent Employees", value: "Not available" },
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
        <h2 className="text-lg font-bold text-slate-900">
          Employee Attendance Records
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Saved time-in, time-out, break periods, and attendance status will
          appear here.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-4">Employee</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Time In</th>
                <th className="px-4 py-4">Time Out</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No attendance records available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}