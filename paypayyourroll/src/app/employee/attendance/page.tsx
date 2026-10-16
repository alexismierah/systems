
import PageHeading from "@/components/page-heading";

export default function MyAttendancePage() {
  return (
    <>
      <PageHeading
        title="My Attendance"
        description="Review your recorded attendance and working hours."
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Attendance History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your attendance dates, clock-in times, clock-out times, and total
          working hours will appear here.
        </p>
      </section>
    </>
  );
}
