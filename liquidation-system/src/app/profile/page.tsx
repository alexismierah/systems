"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import { Save, Loader2, UserRound } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setName(data.full_name || "");
        setUsername(data.username || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }

    setSaving(false);
  }

  return (
    <AppShell
      title="My Profile"
      description="Manage your personal information"
    >
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 sm:p-8">
        <div className="mb-7 flex items-center gap-3 border-b pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <UserRound size={27} />
          </div>
          <div>
            <h2 className="font-bold">Personal Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your account details.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading profile...
          </p>
        ) : (
          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Username</label>
              <input
                disabled
                value={username}
                className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                disabled
                value={email}
                className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional phone number"
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
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Save Changes
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}