"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  PanelLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Avenir is a licensed font — if you have the font files, load them with
// next/font/local and swap this stack for that font's CSS variable.
// This stack falls back gracefully if Avenir isn't installed on the device.
const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Quotations", href: "/dashboard/quotations", icon: FileText },
];

const otherItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarUser = {
  name: string;
  email: string;
  company: string;
};

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

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

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<SidebarUser>({
    name: "User",
    email: "",
    company: "",
  });
  const [loading, setLoading] = useState(true);
  const accountRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

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

    const handleProfileUpdated = () => loadUser();
    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener("company-updated", handleProfileUpdated);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-white transition-[width] duration-200 ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
      style={{ fontFamily: fontStack, fontWeight: 300 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center py-5 ${
          collapsed ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        <Link
          href="/dashboard"
          className={`leading-tight ${collapsed ? "hidden" : "block"}`}
        >
          <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
            QtKo
          </p>
          <p className="text-[11px] text-gray-400">Quotation System</p>
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4">
        {/* MENU */}
        <div>
          {!collapsed && (
            <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
              Menu
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex h-10 items-center rounded-full text-sm transition ${
                    collapsed ? "justify-center px-0" : "gap-3 px-4"
                  } ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ fontWeight: active ? 500 : 400 }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mx-2 my-4 border-t border-gray-100" />

        {/* OTHERS */}
        <div>
          {!collapsed && (
            <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
              Others
            </p>
          )}

          <div className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex h-10 items-center rounded-full text-sm transition ${
                    collapsed ? "justify-center px-0" : "gap-3 px-4"
                  } ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ fontWeight: active ? 500 : 400 }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div className="mx-6 border-t border-gray-100" />
      <div className={`px-4 py-4 ${collapsed ? "flex justify-center" : ""}`}>
        <div ref={accountRef} className="relative min-w-0">
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            className={`flex max-w-full items-center rounded-full py-1 text-sm text-gray-700 transition hover:bg-gray-50 ${
              collapsed ? "px-1" : "gap-2 px-2"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
              style={{ fontWeight: 500 }}
            >
              {loading ? "" : initial}
            </span>
            {!collapsed && (
              <>
                <span className="min-w-0 text-left leading-tight">
                  <span
                    className="block truncate text-sm text-gray-900"
                    style={{ fontWeight: 500 }}
                  >
                    {loading ? "Loading..." : user.name}
                  </span>
                  {user.company && (
                    <span className="block truncate text-xs text-gray-500">
                      {user.company}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              </>
            )}
          </button>

          {accountOpen && (
            <div
              className={`absolute bottom-full z-50 mb-2 rounded-lg border border-gray-100 bg-white py-1 shadow-lg ${
                collapsed ? "left-0 w-40" : "left-0 w-full min-w-[10rem]"
              }`}
              role="menu"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-red-600"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
