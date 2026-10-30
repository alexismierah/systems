
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Mail, Wallet } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/forgot-password`,
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage("If an account exists, a reset link will be sent to your email.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-green-700 text-white">
          <Wallet size={26} />
        </div>

        <h1 className="text-3xl font-bold">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold">
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 w-full rounded-lg border border-gray-200 pl-12 pr-4 text-sm outline-none focus:border-green-700"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="h-12 w-full rounded-lg bg-green-700 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-green-700"
        >
          <ArrowLeft size={17} />
          Back to Login
        </Link>
      </div>
    </main>
  );
}
