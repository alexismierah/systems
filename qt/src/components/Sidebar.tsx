"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
} from "lucide-react";

// Avenir is a licensed font — if you have the font files, load them with
// next/font/local and swap this stack for that font's CSS variable.
// This stack falls back gracefully if Avenir isn't installed on the device.
const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    name: "Quotations",
    href: "/dashboard/quotations",
    icon: FileText,
  },
];

const otherItems = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#F5F6F7]"
      style={{ fontFamily: fontStack, fontWeight: 300 }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="text-xl text-gray-900"
          style={{ fontWeight: 400 }}
        >
          Quotation
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {/* MENU */}
        <div>
          <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 items-center gap-3 rounded-full px-4 text-sm transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
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

        {/* OTHERS */}
        <div className="mt-8">
          <p className="mb-3 px-4 text-[11px] uppercase tracking-wider text-gray-400">
            Others
          </p>

          <div className="space-y-1.5">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 items-center gap-3 rounded-full px-4 text-sm transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
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
    </aside>
  );
}