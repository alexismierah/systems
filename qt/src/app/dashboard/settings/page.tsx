"use client";

import { useEffect, useState } from "react";
import { User, Building2, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

type CompanyInfo = {
  companyName: string;
  streetAddress: string;
  cityStateZip: string;
  website: string;
  phone: string;
  fax: string;
  preparedBy: string;
};

const emptyCompany: CompanyInfo = {
  companyName: "",
  streetAddress: "",
  cityStateZip: "",
  website: "",
  phone: "",
  fax: "",
  preparedBy: "",
};

const inputClass =
  "h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10";

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "company">(
    "profile"
  );

  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [company, setCompany] = useState<CompanyInfo>(emptyCompany);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load the signed-in user's profile from Supabase (not localStorage,
  // which nothing in the app ever populated).
  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      setLoadingProfile(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingProfile(false);
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      setName(
        profile?.full_name ||
          (user.user_metadata?.full_name as string | undefined) ||
          ""
      );
      setEmail(profile?.email || user.email || "");

      setLoadingProfile(false);
    }

    loadProfile();

    // Company / letterhead info used on the quotation template.
    const storedCompany = localStorage.getItem("company-profile");
    if (storedCompany) {
      try {
        setCompany({ ...emptyCompany, ...JSON.parse(storedCompany) });
      } catch {
        setCompany(emptyCompany);
      }
    }
  }, []);

  const saveSettings = async () => {
    setError("");
    setSaving(true);

    try {
      if (activeTab === "profile") {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }

        const supabase = createClient();

        if (userId) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ full_name: name.trim() })
            .eq("id", userId);

          if (updateError) {
            setError(updateError.message);
            return;
          }

          // Keep auth metadata in sync too (used as a fallback everywhere
          // else in the app that reads the display name).
          await supabase.auth.updateUser({
            data: { full_name: name.trim() },
          });
        }

        // Let the sidebar (and anywhere else) know to refresh the name.
        window.dispatchEvent(new Event("profile-updated"));
      }

      if (activeTab === "company") {
        localStorage.setItem("company-profile", JSON.stringify(company));
        window.dispatchEvent(new Event("company-updated"));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "company" as const, label: "Company", icon: Building2 },
  ];

  return (
    <div style={{ fontFamily: fontStack, fontWeight: 300 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your account and company details.
        </p>
      </div>

      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm transition ${
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={{ fontWeight: active ? 500 : 400 }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {activeTab === "profile" && (
          <div className="p-6">
            {loadingProfile ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile...
              </div>
            ) : (
              <div className="max-w-xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                    {getInitials(name, email)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {name || "Your name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {email || "No email on file"}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500 outline-none"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Your email is tied to your account login and
                      can&apos;t be changed here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "company" && (
          <div className="p-6">
            <p className="mb-5 max-w-xl text-sm text-gray-500">
              This information appears on the letterhead of every quotation
              you create.
            </p>

            <div className="grid max-w-xl gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Company name
                </label>
                <input
                  type="text"
                  value={company.companyName}
                  onChange={(e) =>
                    setCompany({ ...company, companyName: e.target.value })
                  }
                  placeholder="Company name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Street address
                </label>
                <input
                  type="text"
                  value={company.streetAddress}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      streetAddress: e.target.value,
                    })
                  }
                  placeholder="Street address"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  City, ST ZIP
                </label>
                <input
                  type="text"
                  value={company.cityStateZip}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      cityStateZip: e.target.value,
                    })
                  }
                  placeholder="City, ST ZIP"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Website
                </label>
                <input
                  type="text"
                  value={company.website}
                  onChange={(e) =>
                    setCompany({ ...company, website: e.target.value })
                  }
                  placeholder="somedomain.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) =>
                    setCompany({ ...company, phone: e.target.value })
                  }
                  placeholder="000-000-0000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Fax</label>
                <input
                  type="text"
                  value={company.fax}
                  onChange={(e) =>
                    setCompany({ ...company, fax: e.target.value })
                  }
                  placeholder="000-000-0000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Prepared by (salesperson)
                </label>
                <input
                  type="text"
                  value={company.preparedBy}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      preparedBy: e.target.value,
                    })
                  }
                  placeholder="Salesperson name"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : saved ? (
            <p className="text-sm text-green-600">Settings saved.</p>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving || loadingProfile}
            className="flex h-11 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}