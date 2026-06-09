"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const e = localStorage.getItem("email");
    if (t) setToken(t);
    if (e) setEmail(e);
    setLoaded(true);
  }, []);

  const login = (newToken, newEmail) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated: !!token, loaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
