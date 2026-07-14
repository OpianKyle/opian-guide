import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type UserRole = "advisor" | "client";
export type AdminRole = "super_admin" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<void>;
  signup: (role: UserRole, name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = "/api";

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check both sessions on mount
  useEffect(() => {
    Promise.all([
      apiFetch("/auth/session").catch(() => null),
      apiFetch("/admin/auth/session").catch(() => null),
    ])
      .then(([userData, adminData]) => {
        setUser(userData?.user ?? null);
        setAdminUser(adminData?.admin ?? null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (role: UserRole, email: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ role, email, password }),
    });
    setUser(data.user);
  }, []);

  const signup = useCallback(async (role: UserRole, name: string, email: string, password: string) => {
    const data = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ role, name, email, password }),
    });
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAdminUser(data.admin);
  }, []);

  const adminLogout = useCallback(async () => {
    await apiFetch("/admin/auth/logout", { method: "POST" });
    setAdminUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, adminUser, isLoading, login, signup, logout, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
