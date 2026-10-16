
import PageHeading from "@/components/page-heading";

export default function MyLeavePage() {
  return (
    <>
      <PageHeading
        title="My Leave"
        description="View your leave balance and request history."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Available Leave</p>
          <p className="mt-3 text-2xl font-bold">0 days</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Pending Requests</p>
          <p className="mt-3 text-2xl font-bold">0</p>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Leave Request History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your leave requests and their statuses will appear here.
        </p>
      </section>
    </>
  );
}
