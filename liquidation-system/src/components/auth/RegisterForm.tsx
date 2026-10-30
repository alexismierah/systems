
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Wallet, UserRound, Mail, Lock,
  Eye, EyeOff, ArrowRight, Loader2
} from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setError("Username must have at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Use only letters, numbers, and underscores.");
      return;
    }

    if (password.length < 8) {
      setError("Password must have at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setSuccess(
          "Account created! Please check your email to verify your account."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-white">
          <Wallet size={27} />
        </div>

        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-green-700">
          Liquidation System
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Create Your Account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please Enter Your Detail
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Username
          </label>

          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-green-700"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-green-700"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-12 text-sm outline-none focus:border-green-700"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            Minimum 8 characters.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Confirm Password
          </label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-green-700"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-green-700 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
