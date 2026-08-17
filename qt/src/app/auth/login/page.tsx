"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />

      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A11.998 11.998 0 0 0 12 24Z"
      />

      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A11.998 11.998 0 0 0 0 12c0 1.94.47 3.77 1.26 5.38l4.01-3.1Z"
      />

      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4.01 3.1 4.01-3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      /*
       * Remember me is handled by Supabase's
       * browser session storage/cookies.
       *
       * The checkbox is kept for your UI.
       */

      if (rememberMe) {
        localStorage.setItem(
          "rememberMe",
          "true"
        );
      } else {
        localStorage.removeItem(
          "rememberMe"
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError(
        "Unable to sign in with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#F5F6F7] px-4 py-10"
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      <div className="w-full max-w-sm">

        {/* Header */}

        <div className="mb-6">
          <h1
            className="text-2xl leading-tight text-gray-900"
            style={{
              fontWeight: 400,
            }}
          >
            Welcome back to
            <br />
            RenderWonders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Login Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >

          {/* Email */}

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="hello@yourstudio.com"
              autoComplete="email"
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {/* Password */}

          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              autoComplete="current-password"
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Remember / Forgot */}

          <div className="flex items-center justify-between pt-1">

            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />

              Remember me
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-gray-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In */}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              fontWeight: 500,
            }}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        {/* Divider */}

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs text-gray-400">
            or
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <GoogleIcon />

          Sign in with Google
        </button>

        {/* Register */}

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}

            <Link
              href="/auth/register"
              className="text-gray-900 hover:underline"
              style={{
                fontWeight: 500,
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}