import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";
import { clearAuthTokens, getAccessToken, getRefreshToken } from "../api/client";

const AuthContext = createContext(null);

// Lightweight "me" derivation: we do not have a dedicated /auth/me endpoint.
// The AuthResponse on login/register gives us fullName, email, roles, userId.
// We persist that minimal profile alongside the tokens.
const PROFILE_KEY = "nlc.profile";

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistProfile(profile) {
  if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(PROFILE_KEY);
}

function profileFromAuth(data) {
  if (!data) return null;
  return {
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    roles: data.roles || [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!getAccessToken() || !getRefreshToken()) return null;
    return readStoredProfile();
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(true);

  useEffect(() => {
    // No /me endpoint — if tokens are present, trust the cached profile.
    setInitialized(true);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const profile = profileFromAuth(data);
      persistProfile(profile);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      const profile = profileFromAuth(data);
      persistProfile(profile);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      persistProfile(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => {
    const isAdmin = Array.isArray(user?.roles) && user.roles.includes("ROLE_ADMIN");
    return {
      user,
      isAuthenticated: Boolean(user),
      isAdmin,
      loading,
      initialized,
      login,
      register,
      logout,
    };
  }, [user, loading, initialized, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
