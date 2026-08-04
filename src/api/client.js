// Centralized API base URL via Vite env. Defaults to local Spring Boot.
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
// Strip any trailing slash so we can safely append paths.
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "nlc.accessToken";
const REFRESH_TOKEN_KEY = "nlc.refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function tryRefresh() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (data?.accessToken) {
      setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body, headers = {}, isForm = false, auth = true, retry = true } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const finalHeaders = { ...headers };
  if (!isForm && body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : isForm
            ? body
            : typeof body === "string"
              ? body
              : JSON.stringify(body),
    });
  } catch (networkErr) {
    const err = new Error("Network error — please check your connection.");
    err.cause = networkErr;
    throw err;
  }

  // Try to refresh once on 401 (and only for authenticated requests).
  if (res.status === 401 && auth && retry) {
    const newToken = await tryRefresh();
    if (newToken) {
      return apiFetch(path, { method, body, headers, isForm, auth, retry: false });
    }
    clearAuthTokens();
  }

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { success: false, message: text };
    }
  }

  if (!res.ok) {
    const message = (payload && payload.message) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  // ApiResponse<T> shape: { success, message, data, timestamp }
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}
