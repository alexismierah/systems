"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hanken_Grotesk } from "next/font/google";
import { Menu, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";

const font = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const STORAGE_KEY = "sidebar-collapsed";

// `title` and `description` are still accepted so existing pages keep working,
// but the header that displayed them has been removed.
type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  // Restore the saved sidebar state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setCollapsed(saved === "true");
    } catch {
      // storage unavailable – keep default
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  if (!authorized) {
    return (
      <div
        className={`${font.className} flex min-h-screen items-center justify-center bg-white antialiased`}
      >
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#262626]" size={30} />
          <p className="mt-3 text-sm text-[#6b6f76]">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${font.className} min-h-screen bg-white text-[#1f1f1f] antialiased`}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <main
        className={`min-h-screen transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[82px]" : "lg:pl-[248px]"
        }`}
      >
        {/* Mobile-only menu button */}
        <button
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-[#ececef] bg-white text-[#3a3d42] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-7">
          {children}
        </div>
      </main>
    </div>
  );
}