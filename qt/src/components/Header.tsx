"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  name?: string;
  email?: string;
};

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const name = user?.name || "User";
  const email = user?.email || "user@example.com";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-6">
      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {name}
            </p>

            <p className="text-xs text-gray-500">
              {email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}