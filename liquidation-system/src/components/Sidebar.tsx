"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Folder,
  UserRound,
  Settings,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const font = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type SidebarProfile = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Categories", href: "/categories", icon: Folder },
  { label: "My Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

function shortName(fullName: string | null | undefined) {
  const parts = (fullName || "User").trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<SidebarProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
    }

    loadProfile();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const avatar = profile?.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are remote and user-supplied
    <img
      src={profile.avatar_url}
      alt="Profile"
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9b8a6] text-sm font-semibold text-white">
      {(profile?.full_name || "U").charAt(0).toUpperCase()}
    </div>
  );

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`${font.className} fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#ececef] bg-white text-[#1f1f1f] antialiased transition-[width,transform] duration-200 lg:translate-x-0 ${
          collapsed ? "w-[82px] items-center" : "w-[248px]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Collapse / expand handle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[30px] hidden h-6 w-6 items-center justify-center rounded-full border border-[#e7e8ea] bg-white text-[#6b6f76] transition hover:bg-[#f7f7f8] hover:text-[#1f1f1f] lg:flex"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <Link
          href="/dashboard"
          onClick={onClose}
          title="Liquidation · Management System"
          className={
            collapsed
              ? "mt-5 flex h-10 w-10 items-center justify-center"
              : "mt-5 flex h-10 items-center gap-3 px-6"
          }
        >
          <Wallet
            size={collapsed ? 30 : 28}
            strokeWidth={1.6}
            className="shrink-0 text-[#1f1f1f]"
          />
          {collapsed ? (
            <span className="sr-only">Liquidation Management System</span>
          ) : (
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight tracking-tight">
                Liquidation
              </p>
              <p className="text-xs leading-tight text-[#8b8f96]">
                Management System
              </p>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav
          className={
            collapsed
              ? "mt-9 flex flex-col items-center gap-3.5"
              : "mt-8 flex flex-col gap-1 px-4"
          }
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/categories" &&
                pathname.startsWith("/categories/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`rounded-lg transition ${
                  collapsed
                    ? "flex h-[58px] w-[64px] flex-col items-center justify-center gap-1.5"
                    : "flex h-11 items-center gap-3 px-3"
                } ${active ? "bg-[#f1f2f4]" : "hover:bg-[#f7f7f8]"}`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.6}
                  className="shrink-0 text-[#3a3d42]"
                />
                <span
                  className={
                    collapsed
                      ? "text-[10.5px] leading-none text-[#6b6f76]"
                      : `text-sm font-medium ${
                          active ? "text-[#1f1f1f]" : "text-[#6b6f76]"
                        }`
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout + profile */}
        <div
          className={
            collapsed
              ? "mt-auto flex flex-col items-center gap-5 pb-5"
              : "mt-auto flex flex-col gap-3 px-4 pb-5"
          }
        >
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`rounded-lg transition hover:bg-red-50 ${
              collapsed
                ? "flex h-[52px] w-[64px] flex-col items-center justify-center gap-1.5"
                : "flex h-11 w-full items-center gap-3 px-3"
            }`}
          >
            <LogOut
              size={20}
              strokeWidth={1.6}
              className="shrink-0 text-[#d6453d]"
            />
            <span
              className={
                collapsed
                  ? "text-[10.5px] leading-none text-[#d6453d]"
                  : "text-sm font-medium text-[#d6453d]"
              }
            >
              Logout
            </span>
          </button>

          {collapsed ? (
            <div
              className="flex flex-col items-center gap-1.5"
              title={`Hello! ${profile?.full_name || "User"} (@${
                profile?.username || "username"
              })`}
            >
              {avatar}
              <span className="max-w-[72px] truncate text-[10.5px] leading-none text-[#6b6f76]">
                {shortName(profile?.full_name)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-t border-[#f0f0f2] px-3 pt-4">
              {avatar}
              <div className="min-w-0">
                <p className="text-xs text-[#8b8f96]">Hello!</p>
                <p className="truncate text-sm font-semibold">
                  {profile?.full_name || "User"}
                </p>
                <p className="truncate text-xs text-[#8b8f96]">
                  @{profile?.username || "username"}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}