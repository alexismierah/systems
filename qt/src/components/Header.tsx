"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Settings, LogOut, ChevronDown } from "lucide-react";

// Avenir is a licensed font — if you have the font files, load them with
// next/font/local and swap this stack for that font's CSS variable.
// This stack falls back gracefully if Avenir isn't installed on the device.
const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // TODO: replace with real user/company data once auth is wired up.
  const user = {
    name: "User",
    email: "hello@yourstudio.com",
    company: "RenderWonders",
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <header
      className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between bg-[#F5F6F7] px-6"
      style={{ fontFamily: fontStack, fontWeight: 300 }}
    >
      {/* Search */}
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="search"
          placeholder="Search..."
          className="h-10 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      {/* Profile */}
      <div className="relative ml-6" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-full border border-transparent py-1 pl-1 pr-3 transition hover:border-gray-200 hover:bg-white"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm text-white"
            style={{ fontWeight: 500 }}
          >
            U
          </div>

          <div className="text-left leading-tight">
            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
              {user.name}
            </p>
            <p className="text-xs text-gray-500">{user.company}</p>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
                {user.name}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>

            <div className="my-1 h-px bg-gray-100" />

            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}