import { apiFetch, setAuthTokens, clearAuthTokens } from "./client";

export async function login({ email, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  if (data?.accessToken) setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function register(payload) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
  if (data?.accessToken) setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function logout() {
  const refresh = localStorage.getItem("nlc.refreshToken");
  try {
    if (refresh) {
      await apiFetch("/auth/logout", {
        method: "POST",
        headers: { "X-Refresh-Token": refresh },
      });
    }
  } catch {
    // swallow; we clear local tokens regardless
  } finally {
    clearAuthTokens();
  }
}

export function isAdminUser(user) {
  if (!user) return false;
  return Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN");
}
