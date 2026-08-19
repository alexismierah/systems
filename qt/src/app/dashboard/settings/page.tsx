"use client";

import { useEffect, useState } from "react";
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
  "h-11 w-full rounded-full border border-[#DBDFE6] bg-white px-5 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10";

const labelClass =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#667085]";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [company, setCompany] =
    useState<CompanyInfo>(emptyCompany);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingCompany, setSavingCompany] =
    useState(false);

  const [profileSaved, setProfileSaved] =
    useState(false);

  const [companySaved, setCompanySaved] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [companyError, setCompanyError] =
    useState("");

  // =========================================================
  // LOAD PROFILE + COMPANY
  // =========================================================

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

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

      setName(
        profile?.full_name ||
          (user.user_metadata
            ?.full_name as
            | string
            | undefined) ||
          ""
      );

      setEmail(
        profile?.email ||
          user.email ||
          ""
      );

      setLoadingProfile(false);
    }

    loadProfile();

    const storedCompany =
      localStorage.getItem(
        "company-profile"
      );

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

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const saveProfile = async () => {
    setProfileError("");
    setProfileSaved(false);
    setSavingProfile(true);

    try {
      if (!name.trim()) {
        setProfileError(
          "Please enter your name."
        );
        return;
      }

      const supabase = createClient();

      if (userId) {
        const { error } =
          await supabase
            .from("profiles")
            .update({
              full_name:
                name.trim(),
            })
            .eq("id", userId);

        if (error) {
          setProfileError(
            error.message
          );
          return;
        }

        await supabase.auth.updateUser({
          data: {
            full_name:
              name.trim(),
          },
        });
      }

      window.dispatchEvent(
        new Event("profile-updated")
      );

      setProfileSaved(true);

      setTimeout(() => {
        setProfileSaved(false);
      }, 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // SAVE COMPANY
  // =========================================================

  const saveCompany = async () => {
    setCompanyError("");
    setCompanySaved(false);
    setSavingCompany(true);

    try {
      localStorage.setItem(
        "company-profile",
        JSON.stringify(company)
      );

      window.dispatchEvent(
        new Event("company-updated")
      );

      setCompanySaved(true);

      setTimeout(() => {
        setCompanySaved(false);
      }, 2000);
    } catch {
      setCompanyError(
        "Unable to save company information."
      );
    } finally {
      setSavingCompany(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-h-full w-full"
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1
          className="text-2xl tracking-tight text-gray-900"
          style={{
            fontWeight: 300,
          }}
        >
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your account and the
          company details that appear on
          your quotations.
        </p>
      </div>

      {/* =====================================================
          SETTINGS LAYOUT

          Full width like Quotations page.
      ===================================================== */}

      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        {/* ===================================================
            SECTION NAV
        =================================================== */}

        <nav className="hidden lg:block">
          <ul className="sticky top-10 space-y-1 border-l border-[#E4E7EC] text-[13.5px]">
            <li>
              <a
                href="#profile"
                className="-ml-px block border-l-2 border-[#14213D] py-1.5 pl-4 text-[#14213D]"
                style={{
                  fontWeight: 500,
                }}
              >
                Profile
              </a>
            </li>

            <li>
              <a
                href="#company"
                className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[#667085] transition hover:border-[#D0D5DD] hover:text-[#101828]"
              >
                Company
              </a>
            </li>
          </ul>
        </nav>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="min-w-0 space-y-8">
          {/* =================================================
              PROFILE PANEL
          ================================================= */}

          <section
            id="profile"
            className="scroll-mt-10 overflow-hidden rounded-lg border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            {/* PANEL HEADER (sticky) */}

            <div className="sticky top-0 z-10 border-b border-[#E4E7EC] bg-white px-6 py-5">
              <h2
                className="text-[15px] text-[#101828]"
                style={{
                  fontWeight: 500,
                }}
              >
                Profile
              </h2>

              <p className="mt-0.5 text-[13px] text-[#667085]">
                Your personal account
                information.
              </p>
            </div>

            {/* PANEL CONTENT */}

            <div className="px-6 py-6">
              {loadingProfile ? (
                <div className="text-[13.5px] text-[#667085]">
                  Loading profile...
                </div>
              ) : (
                <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                  {/* FULL NAME */}

                  <div>
                    <label
                      className={labelClass}
                    >
                      Full name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="Enter your name"
                      className={
                        inputClass
                      }
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label
                      className={labelClass}
                    >
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-5 text-[14px] text-[#98A2B3] outline-none"
                    />

                    <p className="mt-1.5 text-[12px] text-[#98A2B3]">
                      Tied to your login and
                      can&apos;t be changed
                      here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PANEL FOOTER */}

            <div className="flex items-center justify-between border-t border-[#E4E7EC] bg-[#FAFAFB] px-6 py-4">
              <div className="text-[13px]">
                {profileError && (
                  <span className="text-[#B42318]">
                    {profileError}
                  </span>
                )}

                {profileSaved && (
                  <span className="text-[#067647]">
                    Profile saved.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={
                  savingProfile ||
                  loadingProfile
                }
                className="flex h-9 items-center rounded-full bg-[#14213D] px-5 text-[13.5px] text-white transition hover:bg-[#0F1930] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  fontWeight: 500,
                }}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </section>

          {/* =================================================
              COMPANY PANEL
          ================================================= */}

          <section
            id="company"
            className="scroll-mt-10 overflow-hidden rounded-lg border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            {/* PANEL HEADER (sticky) */}

            <div className="sticky top-0 z-10 border-b border-[#E4E7EC] bg-white px-6 py-5">
              <h2
                className="text-[15px] text-[#101828]"
                style={{
                  fontWeight: 500,
                }}
              >
                Company
              </h2>

              <p className="mt-0.5 text-[13px] text-[#667085]">
                Appears on every quotation
                you generate.
              </p>
            </div>

            {/* PANEL CONTENT */}

            <div className="px-6 py-6">
              <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                {/* COMPANY NAME */}

                <div className="sm:col-span-2">
                  <label
                    className={labelClass}
                  >
                    Company name
                  </label>

                  <input
                    type="text"
                    value={
                      company.companyName
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        companyName:
                          e.target.value,
                      })
                    }
                    placeholder="Company name"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* STREET ADDRESS */}

                <div>
                  <label
                    className={labelClass}
                  >
                    Street address
                  </label>

                  <input
                    type="text"
                    value={
                      company.streetAddress
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        streetAddress:
                          e.target.value,
                      })
                    }
                    placeholder="Street address"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* CITY / STATE / ZIP */}

                <div>
                  <label
                    className={labelClass}
                  >
                    City, ST ZIP
                  </label>

                  <input
                    type="text"
                    value={
                      company.cityStateZip
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        cityStateZip:
                          e.target.value,
                      })
                    }
                    placeholder="City, ST ZIP"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* WEBSITE */}

                <div>
                  <label
                    className={labelClass}
                  >
                    Website
                  </label>

                  <input
                    type="text"
                    value={
                      company.website
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        website:
                          e.target.value,
                      })
                    }
                    placeholder="somedomain.com"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    className={labelClass}
                  >
                    Phone
                  </label>

                  <input
                    type="text"
                    value={
                      company.phone
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        phone:
                          e.target.value,
                      })
                    }
                    placeholder="000-000-0000"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* FAX */}

                <div>
                  <label
                    className={labelClass}
                  >
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
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* PREPARED BY */}

                <div>
                  <label
                    className={labelClass}
                  >
                    Prepared by
                  </label>

                  <input
                    type="text"
                    value={
                      company.preparedBy
                    }
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        preparedBy:
                          e.target.value,
                      })
                    }
                    placeholder="Salesperson name"
                    className={
                      inputClass
                    }
                  />
                </div>
              </div>
            </div>

            {/* PANEL FOOTER */}

            <div className="flex items-center justify-between border-t border-[#E4E7EC] bg-[#FAFAFB] px-6 py-4">
              <div className="text-[13px]">
                {companyError && (
                  <span className="text-[#B42318]">
                    {companyError}
                  </span>
                )}

                {companySaved && (
                  <span className="text-[#067647]">
                    Company information
                    saved.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={saveCompany}
                disabled={savingCompany}
                className="flex h-9 items-center rounded-full bg-[#14213D] px-5 text-[13.5px] text-white transition hover:bg-[#0F1930] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  fontWeight: 500,
                }}
              >
                {savingCompany
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}