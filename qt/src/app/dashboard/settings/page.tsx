"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
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

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [company, setCompany] = useState<CompanyInfo>(emptyCompany);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [companyError, setCompanyError] = useState("");

  // Load profile
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

    // Load company information
    const storedCompany = localStorage.getItem("company-profile");

    if (storedCompany) {
      try {
        setCompany({
          ...emptyCompany,
          ...JSON.parse(storedCompany),
        });
      } catch {
        setCompany(emptyCompany);
      }
    }
  }, []);

  // Save Profile
  const saveProfile = async () => {
    setProfileError("");
    setProfileSaved(false);
    setSavingProfile(true);

    try {
      if (!name.trim()) {
        setProfileError("Please enter your name.");
        return;
      }

      const supabase = createClient();

      if (userId) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: name.trim(),
          })
          .eq("id", userId);

        if (updateError) {
          setProfileError(updateError.message);
          return;
        }

        // Keep auth metadata in sync
        await supabase.auth.updateUser({
          data: {
            full_name: name.trim(),
          },
        });
      }

      // Notify sidebar
      window.dispatchEvent(new Event("profile-updated"));

      setProfileSaved(true);

      setTimeout(() => {
        setProfileSaved(false);
      }, 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Company
  const saveCompany = async () => {
    setCompanyError("");
    setCompanySaved(false);
    setSavingCompany(true);

    try {
      localStorage.setItem(
        "company-profile",
        JSON.stringify(company)
      );

      // Notify sidebar
      window.dispatchEvent(new Event("company-updated"));

      setCompanySaved(true);

      setTimeout(() => {
        setCompanySaved(false);
      }, 2000);
    } catch {
      setCompanyError("Unable to save company information.");
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your account and company details.
        </p>
      </div>

      {/* ========================= */}
      {/* PROFILE */}
      {/* ========================= */}

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Section Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2
            className="text-base text-gray-900"
            style={{ fontWeight: 500 }}
          >
            Profile
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal account information.
          </p>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {loadingProfile ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading profile...
            </div>
          ) : (
            <div className="max-w-xl">
              <div className="space-y-5">
                {/* Full Name */}
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

                {/* Email */}
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

        {/* Profile Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          {profileError ? (
            <p className="text-sm text-red-600">
              {profileError}
            </p>
          ) : profileSaved ? (
            <p className="text-sm text-green-600">
              Profile saved.
            </p>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile || loadingProfile}
            className="flex h-11 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>

      {/* ========================= */}
      {/* COMPANY */}
      {/* ========================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Section Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2
            className="text-base text-gray-900"
            style={{ fontWeight: 500 }}
          >
            Company
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage the company information displayed on your quotations.
          </p>
        </div>

        {/* Company Content */}
        <div className="p-6">
          <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
            {/* Company Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Company name
              </label>

              <input
                type="text"
                value={company.companyName}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    companyName: e.target.value,
                  })
                }
                placeholder="Company name"
                className={inputClass}
              />
            </div>

            {/* Street Address */}
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

            {/* City / State / ZIP */}
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

            {/* Website */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Website
              </label>

              <input
                type="text"
                value={company.website}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    website: e.target.value,
                  })
                }
                placeholder="somedomain.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                type="text"
                value={company.phone}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    phone: e.target.value,
                  })
                }
                placeholder="000-000-0000"
                className={inputClass}
              />
            </div>

            {/* Fax */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Fax
              </label>

              <input
                type="text"
                value={company.fax}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    fax: e.target.value,
                  })
                }
                placeholder="000-000-0000"
                className={inputClass}
              />
            </div>

            {/* Prepared By */}
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

        {/* Company Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          {companyError ? (
            <p className="text-sm text-red-600">
              {companyError}
            </p>
          ) : companySaved ? (
            <p className="text-sm text-green-600">
              Company information saved.
            </p>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={saveCompany}
            disabled={savingCompany}
            className="flex h-11 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {savingCompany ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {savingCompany ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>
    </div>
  );
}