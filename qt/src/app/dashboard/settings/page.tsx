"use client";

import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Palette,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("settings");

    if (!stored) {
      return;
    }

    try {
      const settings = JSON.parse(stored);

      setName(settings.name || "");
      setEmail(settings.email || "");
      setDarkMode(settings.darkMode || false);
      setEmailNotifications(
        settings.emailNotifications ?? true
      );
    } catch {
      // Ignore invalid settings
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        name,
        email,
        darkMode,
        emailNotifications,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your account and application preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Settings Tabs */}
        <div className="w-full lg:w-56">
          <div className="rounded-xl border bg-white p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />

                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="rounded-xl border bg-white">
            {activeTab === "profile" && (
              <>
                <div className="border-b px-6 py-5">
                  <h2 className="font-semibold">
                    Profile
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update your account information.
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Enter your name"
                      className="h-11 w-full max-w-xl rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Enter your email"
                      className="h-11 w-full max-w-xl rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "appearance" && (
              <>
                <div className="border-b px-6 py-5">
                  <h2 className="font-semibold">
                    Appearance
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customize the appearance of the
                    application.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex max-w-xl items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">
                        Dark Mode
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Use a darker appearance.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDarkMode(!darkMode)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        darkMode
                          ? "bg-gray-900"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          darkMode
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <div className="border-b px-6 py-5">
                  <h2 className="font-semibold">
                    Notifications
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your notification preferences.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex max-w-xl items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">
                        Email Notifications
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Receive notifications through email.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEmailNotifications(
                          !emailNotifications
                        )
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        emailNotifications
                          ? "bg-gray-900"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          emailNotifications
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t px-6 py-4">
              {saved ? (
                <p className="text-sm text-green-600">
                  Settings saved successfully.
                </p>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={saveSettings}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}