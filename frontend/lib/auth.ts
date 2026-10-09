import type { AuthUser } from "@/types";

const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as AuthUser; } catch { return null; }
}

export function clearAuth() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
export function isLoggedIn() { return Boolean(getToken()); }
