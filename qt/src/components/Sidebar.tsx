"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  CheckSquare,
  Bell,
  ChevronDown,
  Sun,
  Moon,
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

// Wire these up to real data whenever it's available — placeholders for now
// so the layout matches the reference without inventing fake counts.
const quickStats = [
  { name: "My Tasks", icon: CheckSquare, count: 2, badgeClass: "bg-blue-100 text-blue-700" },
  { name: "Activities", icon: Bell, count: 8, badgeClass: "bg-rose-100 text-rose-700" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-white"
      style={{ fontFamily: fontStack, fontWeight: 300 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
              QtKo
            </p>
            <p className="text-[11px] text-gray-400">Quotation System</p>
          </div>
        </Link>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Collapse sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Quick stats */}
      <div className="space-y-1 px-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="flex h-10 items-center justify-between rounded-full px-4 text-sm text-gray-600"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400" />
                {stat.name}
              </span>
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] ${stat.badgeClass}`}
                style={{ fontWeight: 500 }}
              >
                {stat.count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mx-6 my-4 border-t border-gray-100" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4">
        {/* MENU */}
        <div>
          <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-full px-4 text-sm transition ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ fontWeight: active ? 500 : 400 }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mx-2 my-4 border-t border-gray-100" />

        {/* OTHERS */}
        <div>
          <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
            Others
          </p>

          <div className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-full px-4 text-sm transition ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ fontWeight: active ? 500 : 400 }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User / logout */}
      <div className="mx-6 border-t border-gray-100" />
      <div className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
            U
          </span>
          <span style={{ fontWeight: 500 }}>Account</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

        <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm"
            aria-label="Light mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400"
            aria-label="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-full px-4 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}