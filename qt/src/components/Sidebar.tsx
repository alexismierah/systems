"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
} from "lucide-react";

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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight"
        >
          Quotation
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {/* MENU */}
        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* OTHERS */}
        <div className="mt-8">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />

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