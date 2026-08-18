"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Avenir is a licensed font — if you have the font files, load them with
// next/font/local and swap this stack for that font's CSS variable.
// This stack falls back gracefully if Avenir isn't installed on the device.
const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

type HeaderUser = {
  name: string;
  email: string;
  company: string;
};

// Company name lives in local business settings (see Settings > Company),
// separate from the authenticated identity which comes from Supabase.
function readCompanyName(): string {
  try {
    const raw = localStorage.getItem("company-profile");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.companyName || "";
  } catch {
    return "";
  }
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser>({
    name: "User",
    email: "",
    company: "",
  });

  const [loading, setLoading] = useState(true);

  // Load the signed-in user from Supabase (auth identity + profiles table)
  // instead of localStorage, which nothing in the app ever writes to.
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!authUser) {
        setUser({ name: "User", email: "", company: readCompanyName() });
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!active) return;

      const name =
        profile?.full_name?.trim() ||
        (authUser.user_metadata?.full_name as string | undefined)?.trim() ||
        authUser.email?.split("@")[0] ||
        "User";

      setUser({
        name,
        email: profile?.email || authUser.email || "",
        company: readCompanyName(),
      });

      setLoading(false);
    }

    loadUser();

    // Keep the header in sync when Settings saves a profile/company change.
    const handleProfileUpdated = () => loadUser();
    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener("company-updated", handleProfileUpdated);

    // Keep the header in sync with sign-in / sign-out events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      active = false;
      window.removeEventListener("profile-updated", handleProfileUpdated);
      window.removeEventListener("company-updated", handleProfileUpdated);
      subscription.unsubscribe();
    };
  }, []);

  const initial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <header
      className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-end bg-[#F5F6F7] px-6"
      style={{ fontFamily: fontStack, fontWeight: 300 }}
    >
      {/* Profile */}
      <div className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm text-white"
          style={{ fontWeight: 500 }}
        >
          {loading ? "" : initial}
        </div>

        <div className="text-left leading-tight">
          <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
            {loading ? "Loading..." : user.name}
          </p>
          {user.company && (
            <p className="text-xs text-gray-500">{user.company}</p>
          )}
        </div>
      </div>
    </header>
  );
} 