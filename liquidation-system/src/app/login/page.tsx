"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hanken_Grotesk } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  Loader2,
  Search,
  Copy,
  Layers,
  FolderOpen,
  Users,
  BookOpen,
  Bell,
  ChevronDown,
  Infinity as InfinityIcon,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Play,
  Target,
  BadgeCheck,
} from "lucide-react";

const font = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* ------------------------------------------------------------------ */
/* Static preview data (decorative right-hand side)                    */
/* ------------------------------------------------------------------ */

type Row = {
  name: string;
  age: string;
  status: string;
  statusColor: string;
  icon: React.ReactNode;
  iconBg: string;
  people: { label: string; extra?: string; color: string; initial: string };
};

const rows: Row[] = [
  {
    name: "Venture Capital Partners",
    age: "3 years",
    status: "On track",
    statusColor: "bg-[#5fc17e]",
    iconBg: "bg-[#dff3e5] text-[#4aa868]",
    icon: <MoreHorizontal size={13} />,
    people: { label: "Ollie N.", color: "bg-[#8d6e63]", initial: "O" },
  },
  {
    name: "Venture Capital Group",
    age: "2 years",
    status: "On track",
    statusColor: "bg-[#5fc17e]",
    iconBg: "bg-[#dff3e5] text-[#4aa868]",
    icon: <CheckCircle2 size={13} />,
    people: {
      label: "Dolpher E.",
      extra: "+2",
      color: "bg-[#6d7b8d]",
      initial: "D",
    },
  },
  {
    name: "Venture Capital Ventures",
    age: "5 years",
    status: "On hold",
    statusColor: "bg-[#f1b25e]",
    iconBg: "bg-transparent text-[#f1b25e]",
    icon: <Play size={17} fill="currentColor" />,
    people: {
      label: "Alec M.",
      extra: "+2",
      color: "bg-[#a1887f]",
      initial: "A",
    },
  },
  {
    name: "Venture Capital Associates",
    age: "4 years",
    status: "On track",
    statusColor: "bg-[#5fc17e]",
    iconBg: "bg-[#dff3e5] text-[#4aa868]",
    icon: <Target size={13} />,
    people: { label: "Gregory S.", color: "bg-[#b0825f]", initial: "G" },
  },
  {
    name: "Venture Capital Solutions",
    age: "6 years",
    status: "In progress",
    statusColor: "bg-[#5fc17e]",
    iconBg: "bg-[#dff3e5] text-[#4aa868]",
    icon: <CheckCircle2 size={13} />,
    people: { label: "Connar G.", color: "bg-[#7a5c4d]", initial: "C" },
  },
  {
    name: "Venture Capital Technologies",
    age: "2 years",
    status: "Completed",
    statusColor: "bg-[#2f5de8]",
    iconBg: "bg-[#e3ebff] text-[#2f5de8]",
    icon: <BadgeCheck size={13} />,
    people: {
      label: "Tallie U.",
      extra: "+1",
      color: "bg-[#5b4636]",
      initial: "T",
    },
  },
];

const navItems = [
  { label: "Search", icon: Search },
  { label: "Portfolio", icon: Copy, active: true },
  { label: "Investors", icon: Layers },
  { label: "Deals", icon: FolderOpen },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_by_username",
      { input_username: username.trim().toLowerCase() }
    );

    if (lookupError || !email) {
      setError("Invalid username or password.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Invalid username or password.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-md border border-transparent bg-[#f4f5f6] px-4 py-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100";

  return (
    <main
      className={`${font.className} relative min-h-screen overflow-hidden bg-white text-[#1f1f1f] antialiased`}
    >
      {/* ---------------- Decorative circles ---------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[40vw] top-1/2 hidden h-[135vh] w-[135vh] -translate-y-1/2 rounded-full border border-[#e6e7ea] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[50vw] top-1/2 hidden h-[88vh] w-[88vh] -translate-y-1/2 rounded-full border border-[#cfcaef] lg:block"
      />

      {/* ---------------- Logo ---------------- */}
      <div className="absolute left-7 top-5 z-20 flex items-center gap-2 sm:left-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicon.ico"
          alt="Liquidation Management System"
          className="h-28 w-28 shrink-0 object-contain"
        />
      </div>

      {/* ---------------- Left: form ---------------- */}
      <section className="relative z-10 flex min-h-screen w-full items-center px-6 pb-24 pt-40 lg:w-[47%] lg:px-0 lg:py-24">
        <div className="mx-auto w-full max-w-[380px] lg:ml-[22.7%] lg:mr-0 lg:w-[57.5%] lg:min-w-[340px]">
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">
            Welcome Back
          </h1>
          <p className="mt-3 text-[14px] text-[#6b6f76]">
            Log in to your liquidation account.
          </p>

          <form onSubmit={login} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-[#6b6f76]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[#262626]"
                />
                Remember Me
              </label>

              <Link
                href="/forgot-password"
                className="font-medium text-[#1f1f1f] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#262626] text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Log In
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#6b6f76]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#1f1f1f] hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- Right: product preview ---------------- */}
      <div
        aria-hidden="true"
        className="absolute left-[47.5%] top-[10.5vh] z-10 hidden h-[79vh] w-[110%] overflow-hidden rounded-tl-xl rounded-bl-xl border border-[#ececef] bg-white shadow-[0_24px_60px_-28px_rgba(20,20,40,0.18)] lg:flex"
      >
        {/* Sidebar */}
        <div className="flex w-[72px] shrink-0 flex-col items-center border-r border-[#f0f0f2] py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.ico"
            alt=""
            className="h-11 w-11 shrink-0 object-contain"
          />

          <div className="mt-6 flex flex-col items-center gap-3">
            {navItems.map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex h-[46px] w-[50px] flex-col items-center justify-center gap-1 rounded-lg ${
                  active ? "bg-[#f1f2f4]" : ""
                }`}
              >
                <Icon size={15} className="text-[#3a3d42]" />
                <span className="text-[8.5px] text-[#6b6f76]">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col items-center gap-5 text-[#6b6f76]">
            <Users size={14} />
            <BookOpen size={14} />
            <div className="relative">
              <Bell size={14} />
              <span className="absolute -right-2 -top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ef7a5c] text-[8px] font-semibold text-white">
                1
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9b8a6] text-[10px] font-semibold text-white">
                I
              </div>
              <span className="text-[8px]">Ira W.</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 px-8 pt-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6b6f76]">
            Browse
          </p>

          <h2 className="mt-5 text-[30px] font-medium tracking-[-0.02em]">
            Portfolios
          </h2>

          <div className="mt-4 flex items-center gap-4 text-[12px]">
            <div className="flex items-center gap-2 rounded-md border border-[#e7e8ea] px-2.5 py-1.5">
              <InfinityIcon size={13} className="text-[#6b6f76]" />
              <span className="font-medium">All portfolios</span>
              <ChevronDown size={12} className="text-[#6b6f76]" />
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Plus size={12} className="text-[#6b6f76]" />
              Filter
            </div>
          </div>

          {/* Table header */}
          <div className="mt-8 grid grid-cols-[340px_190px_1fr] border-b border-[#f0f0f2] pb-2.5 text-[10px] text-[#8b8f96]">
            <span>Name</span>
            <span>Status</span>
            <span>Collaborators</span>
          </div>

          {/* Rows */}
          {rows.map((r) => (
            <div
              key={r.name}
              className="grid grid-cols-[340px_190px_1fr] items-center border-b border-[#f0f0f2] py-[14px]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${r.iconBg}`}
                >
                  {r.icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-tight">
                    {r.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-[#8b8f96]">{r.age}</p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-[5px] px-2 py-[3px] text-[10.5px] font-semibold text-white ${r.statusColor}`}
                >
                  {r.status}
                  <ChevronDown size={11} />
                </span>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-[#f4f5f6] px-2 py-1 text-[11.5px] font-medium">
                  <span
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold text-white ${r.people.color}`}
                  >
                    {r.people.initial}
                  </span>
                  {r.people.label}
                  {r.people.extra && <span>{r.people.extra}</span>}
                  {r.people.extra && (
                    <ChevronDown size={11} className="text-[#6b6f76]" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}