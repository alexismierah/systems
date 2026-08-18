const REMEMBER_ME_KEY = "rememberMe";

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export function setRememberMe(remember: boolean) {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

export function getAuthRedirectUrl(path = "/dashboard") {
  if (typeof window === "undefined") {
    return `/auth/callback?next=${encodeURIComponent(path)}`;
  }

  const callback = `${window.location.origin}/auth/callback`;

  if (path === "/dashboard") {
    return callback;
  }

  return `${callback}?next=${encodeURIComponent(path)}`;
}

export function getPasswordResetRedirectUrl() {
  if (typeof window === "undefined") {
    return "/auth/reset-password";
  }

  return `${window.location.origin}/auth/reset-password`;
}

export async function requestPasswordReset(email: string) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirectUrl(),
  });
}

export async function startOAuthRedirect(
  provider: "google",
  redirectPath = "/dashboard"
) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthRedirectUrl(redirectPath),
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "Unable to start Google sign-in." };
  }

  window.location.assign(data.url);
  return { error: null };
}
