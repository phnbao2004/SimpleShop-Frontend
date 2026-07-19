"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearStoredSession, redirectToLogin } from "@/lib/api";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}

function isValidSession(token, user) {
  const claims = decodeToken(token);
  if (!claims || !claims.exp || claims.exp * 1000 <= Date.now()) return false;
  if (String(claims.userId) !== String(user?.userId)) return false;
  return claims.role === user?.role;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("auth_user");
    let invalidStoredSession = false;
    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (storedToken && parsedUser && isValidSession(storedToken, parsedUser)) {
        setToken(storedToken);
        setUser(parsedUser);
      } else if (storedToken || storedUser) {
        clearStoredSession();
        invalidStoredSession = true;
      }
    } catch {
      clearStoredSession();
      invalidStoredSession = true;
    } finally {
      setLoading(false);
      if (invalidStoredSession) {
        redirectToLogin("Your saved session is invalid or expired. Please sign in again.");
      }
    }

    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", onUnauthorized);
    return () => window.removeEventListener("auth:logout", onUnauthorized);
  }, []);

  useEffect(() => {
    if (!token) return;
    const claims = decodeToken(token);
    const remaining = claims?.exp * 1000 - Date.now();
    if (!remaining || remaining <= 0) {
      clearSession();
      redirectToLogin("Your session has expired. Please sign in again.");
      return;
    }
    const timer = window.setTimeout(() => {
      clearSession();
      redirectToLogin("Your session has expired. Please sign in again.");
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [token, clearSession]);

  const login = (newToken, newUser) => {
    if (!isValidSession(newToken, newUser)) throw new Error("Invalid login token received.");
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => clearSession();

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        loaded: !loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "Admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
