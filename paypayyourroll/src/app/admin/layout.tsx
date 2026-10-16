import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load your profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please contact your system administrator.
          </p>
          <form action="/auth/signout" method="POST" className="mt-5">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (profile.role !== "admin") {
    redirect("/employee/dashboard");
  }

  return (
    <DashboardShell
      role="admin"
      name={profile.full_name || user.email || "Administrator"}
    >
      {children}
    </DashboardShell>
  );
}