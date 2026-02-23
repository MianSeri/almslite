import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [nonprofit, setNonprofit] = useState(() => {
    const raw = localStorage.getItem("nonprofit");
    return raw ? JSON.parse(raw) : null;
  });

  function login({ token, nonprofit }) {
    localStorage.setItem("token", token);
    localStorage.setItem("nonprofit", JSON.stringify(nonprofit));
    setToken(token);
    setNonprofit(nonprofit);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nonprofit");
    setToken(null);
    setNonprofit(null);
  }

  const value = { token, nonprofit, isAuthed: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
