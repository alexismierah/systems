"use client";

import { useEffect, useRef, useState } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import {
  Camera,
  Check,
  Trash2,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const font = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cardClass =
  "min-w-0 rounded-[20px] border border-[#e7e8ea] bg-white p-6";

const inputClass =
  "w-full rounded-lg border border-[#e7e8ea] bg-white px-3.5 py-2.5 text-[14px] outline-none transition focus:border-[#262626]";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function SettingsPage() {
  const [supabase] = useState(() => createClient());

  // Profile
  const [pageLoading, setPageLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedPhone, setSavedPhone] = useState("");

  // Profile picture
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPageLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setName(data.full_name || "");
        setSavedName(data.full_name || "");
        setUsername(data.username || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setSavedPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || "");
      } else {
        setEmail(user.email || "");
      }

      setPageLoading(false);
    }

    load();
  }, [supabase]);

  function cancelEdit() {
    setName(savedName);
    setPhone(savedPhone);
    setProfileError("");
    setEditing(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfileError("Please log in again.");
      setSavingProfile(false);
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
      setProfileError(error.message);
    } else {
      setName(name.trim());
      setPhone(phone.trim());
      setSavedName(name.trim());
      setSavedPhone(phone.trim());
      setProfileMessage("Profile updated successfully.");
      setEditing(false);
    }

    setSavingProfile(false);
  }

  function storagePathFromUrl(url: string) {
    return url.split("/avatars/")[1]?.split("?")[0] || "";
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Please upload a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2MB or smaller.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAvatarError("Please log in again.");
      setUploading(false);
      return;
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      setAvatarError(updateError.message);
      setUploading(false);
      return;
    }

    // Best-effort cleanup of the previous picture
    const oldPath = storagePathFromUrl(avatarUrl);
    if (oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
    }

    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  async function removeAvatar() {
    setAvatarError("");
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAvatarError("Please log in again.");
      setUploading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (error) {
      setAvatarError(error.message);
      setUploading(false);
      return;
    }

    const oldPath = storagePathFromUrl(avatarUrl);
    if (oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
    }

    setAvatarUrl("");
    setUploading(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (password.length < 8) {
      setPasswordError("Password must have at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage("Password changed successfully.");
      setPassword("");
      setConfirm("");
    }

    setSavingPassword(false);
  }

  return (
    <AppShell
      title="Settings"
      description="Manage your profile and account security"
    >
      <div className={`${font.className} text-[#1f1f1f] antialiased`}>
        {/* Page header */}
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b6f76]">
          Settings
        </p>

        <h1 className="mt-4 text-[34px] font-medium leading-tight tracking-[-0.025em] sm:text-[44px]">
          Account Settings
        </h1>
        <p className="mt-3 text-[15px] text-[#6b6f76]">
          Manage your profile, password and privacy in one place.
        </p>

        {pageLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto animate-spin text-[#262626]" />
            <p className="mt-3 text-sm text-[#8b8f96]">Loading settings...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
            {/* ---------- Profile summary card ---------- */}
            <section className={`${cardClass} lg:self-start`}>
              <div className="relative h-[96px] w-[96px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#262626] text-[32px] font-semibold text-white">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile picture"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(savedName)
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 size={22} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change profile picture"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#262626] text-white transition hover:bg-[#3a3a3a] disabled:opacity-50"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#8b8f96] transition hover:text-[#e5533d] disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remove photo
                </button>
              )}

              {avatarError && (
                <p className="mt-3 rounded-lg bg-[#fde8e4] p-2.5 text-[12px] text-[#e5533d]">
                  {avatarError}
                </p>
              )}

              <h2 className="mt-5 truncate text-[24px] font-semibold leading-tight tracking-[-0.02em]">
                {savedName || "Your name"}
              </h2>
              <p className="mt-1.5 truncate text-[14px] text-[#8b8f96]">
                {username ? `@${username}` : "No username"}
              </p>

              <div className="my-6 h-px bg-[#ececef]" />

              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dff3e5] text-[#3f9e5f]">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8b8f96]">Email</p>
                    <p className="truncate text-[14px] font-semibold">
                      {email || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#d9922f]">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8b8f96]">Phone</p>
                    <p className="truncate text-[14px] font-semibold">
                      {savedPhone || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- Right column ---------- */}
            <div className="grid min-w-0 content-start gap-4">
              {/* Profile details */}
              <section className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#262626] text-white">
                      <UserRound size={22} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h2 className="text-[15px] text-[#6b6f76]">
                        Personal Information
                      </h2>
                      <p className="mt-1 text-xs text-[#8b8f96]">
                        Update your account details
                      </p>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMessage("");
                        setEditing(true);
                      }}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e7e8ea] bg-white px-3.5 py-1.5 text-[13px] font-medium transition hover:bg-[#f7f7f8]"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  )}
                </div>

                <form onSubmit={saveProfile} className="mt-5">
                  <div className="text-[14px]">
                    <Row label="Full Name">
                      {editing ? (
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClass}
                        />
                      ) : (
                        <span className="font-semibold">
                          {savedName || "—"}
                        </span>
                      )}
                    </Row>

                    <Row label="Username">
                      <span className="font-semibold">{username || "—"}</span>
                    </Row>

                    <Row label="Email">
                      <span className="font-semibold">{email || "—"}</span>
                    </Row>

                    <Row label="Phone Number" last>
                      {editing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Optional phone number"
                          className={inputClass}
                        />
                      ) : (
                        <span className="font-semibold">
                          {savedPhone || "—"}
                        </span>
                      )}
                    </Row>
                  </div>

                  {profileError && (
                    <p className="mt-4 rounded-lg bg-[#fde8e4] p-3 text-[13px] text-[#e5533d]">
                      {profileError}
                    </p>
                  )}

                  {profileMessage && (
                    <p className="mt-4 rounded-lg bg-[#dff3e5] p-3 text-[13px] text-[#3f9e5f]">
                      {profileMessage}
                    </p>
                  )}

                  {editing && (
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        disabled={savingProfile}
                        className="flex items-center gap-2 rounded-lg bg-[#262626] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Check size={15} />
                        )}
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingProfile}
                        className="flex items-center gap-2 rounded-lg border border-[#e7e8ea] bg-white px-4 py-2.5 text-[13px] font-medium transition hover:bg-[#f7f7f8]"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </section>

              {/* Change password */}
              <section className={cardClass}>
                <div className="flex items-start gap-4">
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#d9922f]">
                    <Lock size={22} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="text-[15px] text-[#6b6f76]">
                      Change Password
                    </h2>
                    <p className="mt-1 text-xs text-[#8b8f96]">
                      Update your account password
                    </p>
                  </div>
                </div>

                <form onSubmit={changePassword} className="mt-5">
                  <div className="text-[14px]">
                    <div className="flex flex-col gap-2 border-b border-[#ececef] py-4 sm:flex-row sm:items-center sm:gap-0">
                      <label className="w-40 shrink-0 text-[#6b6f76]">
                        New Password
                      </label>
                      <div className="flex-1">
                        <input
                          required
                          minLength={8}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-0">
                      <label className="w-40 shrink-0 text-[#6b6f76]">
                        Confirm Password
                      </label>
                      <div className="flex-1">
                        <input
                          required
                          minLength={8}
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Confirm new password"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {passwordError && (
                    <p className="mt-2 rounded-lg bg-[#fde8e4] p-3 text-[13px] text-[#e5533d]">
                      {passwordError}
                    </p>
                  )}

                  {passwordMessage && (
                    <p className="mt-2 rounded-lg bg-[#dff3e5] p-3 text-[13px] text-[#3f9e5f]">
                      {passwordMessage}
                    </p>
                  )}

                  <button
                    disabled={savingPassword}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-[#262626] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-50"
                  >
                    {savingPassword && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    Update Password
                  </button>
                </form>
              </section>

              {/* Privacy */}
              <section className={cardClass}>
                <div className="flex items-start gap-4">
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#dff3e5] text-[#3f9e5f]">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="text-[15px] text-[#6b6f76]">
                      Account Privacy
                    </h2>
                    <p className="mt-2 text-[14px] text-[#4a4e55]">
                      Your categories and liquidation records are private to
                      your account.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-0 ${
        last ? "" : "border-b border-[#ececef]"
      }`}
    >
      <p className="w-40 shrink-0 text-[#6b6f76]">{label}</p>
      <div className="min-w-0 flex-1 break-words">{children}</div>
    </div>
  );
}