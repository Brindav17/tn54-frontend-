import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api";

const AuthContext = createContext(null);
const TOKEN_KEY = "thyroscan_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  // Only block on an /auth/me round-trip when a stored token needs verifying.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    api.setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    api
      .fetchMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistSession = useCallback(({ access_token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    api.setAuthToken(access_token);
    setToken(access_token);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email, password) => persistSession(await api.registerUser({ email, password })),
    [persistSession]
  );

  const login = useCallback(
    async (email, password) => persistSession(await api.loginUser({ email, password })),
    [persistSession]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => persistSession(await api.loginWithGoogle(idToken)),
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook is the standard pairing
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
