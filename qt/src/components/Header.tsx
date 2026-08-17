"use client";

import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="search"
          placeholder="Search..."
          className="h-10 w-full rounded-lg border bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {/* Right */}
      <div className="ml-6 flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
          U
        </div>
      </div>
    </header>
  );
}