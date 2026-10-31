"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function redirectUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      router.replace(user ? "/dashboard" : "/login");
    }

    redirectUser();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f7]">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-green-700" size={30} />
        <p className="mt-3 text-sm text-gray-500">Loading application...</p>
      </div>
    </main>
  );
}