import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="sr-only">Checking session…</div>}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/dashboard");
  }

  return redirect("/login");
}