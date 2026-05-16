/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF || "lszwlirvgvqbadropysm"}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

const AuthContext = createContext(null);

function toAppUser(user) {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const fallbackName = user.email?.split("@")[0] || "User";

  return {
    ...user,
    sub: user.id,
    name: metadata.full_name || metadata.name || fallbackName,
    email: user.email,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const user = toAppUser(session?.user);

    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async loginWithRedirect() {
        window.location.assign("/login");
      },
      async logout(options = {}) {
        await supabase.auth.signOut();
        const returnTo = options.logoutParams?.returnTo;
        if (returnTo) window.location.assign(returnTo);
      },
    };
  }, [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
