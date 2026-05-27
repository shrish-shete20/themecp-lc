/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_STORAGE_KEY = "themecp_lc_auth_token";
const USER_STORAGE_KEY = "themecp_lc_auth_user";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistAuthSession(nextUser, token) {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  } catch {
    // localStorage can be unavailable in private browser contexts.
  }
}

export function clearAuthSession() {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // localStorage can be unavailable in private browser contexts.
  }
}

async function authRequest(path, body, token = null) {
  if (!API_URL) {
    throw new Error("Backend API URL is not configured.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Authentication request failed.");
  }

  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    let mounted = true;
    const token = getAuthToken();

    if (!token) {
      return () => {
        mounted = false;
      };
    }

    authRequest("/auth/me", null, token)
      .then(({ user: currentUser }) => {
        if (!mounted) return;
        setUser(currentUser);
        persistAuthSession(currentUser, token);
      })
      .catch(() => {
        if (!mounted) return;
        clearAuthSession();
        setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async signIn({ email, password }) {
        const result = await authRequest("/auth/login", { email, password });
        persistAuthSession(result.user, result.token);
        setUser(result.user);
        return result;
      },
      async signUp({ email, password, name }) {
        const result = await authRequest("/auth/signup", { email, password, name });
        persistAuthSession(result.user, result.token);
        setUser(result.user);
        return result;
      },
      async loginWithRedirect() {
        window.location.assign("/login");
      },
      async logout(options = {}) {
        clearAuthSession();
        setUser(null);
        const returnTo = options.logoutParams?.returnTo;
        if (returnTo) window.location.assign(returnTo);
      },
    };
  }, [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
