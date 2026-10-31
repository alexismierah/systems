"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must have at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password changed successfully.");
      setPassword("");
      setConfirm("");
    }

    setLoading(false);
  }

  return (
    <AppShell title="Settings" description="Manage your account security">
      <div className="max-w-2xl space-y-5">
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="font-bold">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your account password.
              </p>
            </div>
          </div>

          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                New Password
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading && <Loader2 size={17} className="animate-spin" />}
              Update Password
            </button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold">Account Privacy</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your categories and liquidation records are private to your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}