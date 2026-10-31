
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Folder,
  Settings,
  LogOut,
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
  email: string | null;
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const navSections = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Categories", href: "/categories", icon: Folder },
    ],
  },
  {
    title: "Others",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
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
  const [supabase] = useState(() => createClient());

  const [profile, setProfile] = useState<SidebarProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, email")
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatar_url}
      alt="Profile"
      className="h-11 w-11 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9b8a6] text-sm font-semibold text-white">
      {(profile?.full_name || "U").charAt(0).toUpperCase()}
    </div>
  );

  const profileAvatar = (
    <>
      <span className="lg:hidden">{avatar}</span>

      <button
        type="button"
        onClick={logout}
        title="Logout"
        aria-label="Logout"
        className="group/avatar relative hidden rounded-full outline-none lg:block"
      >
        {avatar}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#111214]/70 text-white opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100">
          <LogOut size={17} strokeWidth={2} />
        </span>
      </button>
    </>
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
        className={`${font.className} fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-white via-[#f4f7f8] to-[#e6ecee] text-[#111214] antialiased shadow-[1px_0_0_rgba(17,18,20,0.04)] transition-[width,transform] duration-200 lg:translate-x-0 ${
          collapsed ? "w-[82px] items-center" : "w-[248px]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Collapse / expand handle */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[30px] hidden h-6 w-6 items-center justify-center rounded-full border border-[#e3e6e8] bg-white text-[#8b9096] transition hover:text-[#111214] lg:flex"
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
              : "flex h-32 items-center px-6"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.ico"
            alt="Liquidation Management System"
            className={`shrink-0 object-contain ${
              collapsed ? "h-16 w-16" : "h-32 w-32"
            }`}
          />
        </Link>

        {/* Navigation */}
        <nav
          className={
            collapsed
              ? "mt-6 flex w-full flex-col items-center"
              : "-mt-1 flex flex-col px-3"
          }
        >
          {navSections.map((section, index) => (
            <div
              key={section.title}
              className={
                index === 0
                  ? ""
                  : collapsed
                    ? "mt-4 flex w-14 flex-col items-center border-t border-[#dde2e5] pt-4"
                    : "mt-5 border-t border-[#dde2e5] pt-5"
              }
            >
              {!collapsed && (
                <p className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9fa6]">
                  {section.title}
                </p>
              )}

              <div
                className={
                  collapsed
                    ? "flex flex-col items-center gap-3"
                    : "flex flex-col gap-1.5"
                }
              >
                {section.items.map((item) => {
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
                      className={
                        collapsed
                          ? `flex h-[58px] w-[64px] flex-col items-center justify-center gap-1.5 rounded-xl transition ${
                              active
                                ? "bg-[#e4e9ec]"
                                : "hover:bg-white/70"
                            }`
                          : `group flex h-11 items-center gap-3.5 rounded-xl px-3 transition ${
                              active
                                ? "bg-[#e4e9ec]"
                                : "hover:bg-[#edf1f3]"
                            }`
                      }
                    >
                      <span
                        className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg transition ${
                          active
                            ? "text-[#111214]"
                            : "text-[#9a9fa6]"
                        }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={active ? 2 : 1.8}
                        />
                      </span>

                      <span
                        className={
                          collapsed
                            ? `text-[10.5px] leading-none ${
                                active
                                  ? "font-semibold text-[#111214]"
                                  : "text-[#9a9fa6]"
                              }`
                            : `text-[14.5px] transition ${
                                active
                                  ? "font-semibold text-[#111214]"
                                  : "font-medium text-[#9a9fa6] group-hover:text-[#111214]"
                              }`
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: logout + profile */}
        <div
          className={
            collapsed
              ? "mt-auto flex flex-col items-center gap-5 pb-6"
              : "mt-auto flex flex-col gap-5 px-6 pb-7"
          }
        >
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={
              collapsed
                ? "flex h-[52px] w-[64px] flex-col items-center justify-center gap-1.5 rounded-xl transition hover:bg-red-50/80 lg:hidden"
                : "group flex h-11 w-full items-center gap-3.5 rounded-xl lg:hidden"
            }
          >
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg text-[#d6453d]">
              <LogOut size={16} strokeWidth={1.8} />
            </span>

            <span
              className={
                collapsed
                  ? "text-[10.5px] leading-none text-[#d6453d]"
                  : "text-[14.5px] font-medium text-[#d6453d]"
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
              {profileAvatar}

              <span className="max-w-[72px] truncate text-[10.5px] leading-none text-[#6b6f76]">
                {shortName(profile?.full_name)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {profileAvatar}

              <p className="mt-0.5 max-w-full truncate text-[15px] font-semibold">
                {profile?.full_name || "User"}
              </p>

              <p className="max-w-full truncate text-[13px] text-[#8b9096]">
                @{profile?.email || "email"}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
