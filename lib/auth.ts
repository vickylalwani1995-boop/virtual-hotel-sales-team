"use client";

import { useEffect, useState } from "react";

export type AuthUser = {
  username: string;
  loggedInAt: string;
};

const KEY = "vhst-user";
const WELCOME_FLAG = "vhst-just-logged-in";
const EVT = "vhst-auth-changed";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.username === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function signIn(username: string) {
  if (typeof window === "undefined") return;
  const user: AuthUser = {
    username: username.trim(),
    loggedInAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(user));
  window.localStorage.setItem(WELCOME_FLAG, "1");
  window.dispatchEvent(new CustomEvent(EVT));
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(WELCOME_FLAG);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function consumeWelcomeFlag(): boolean {
  if (typeof window === "undefined") return false;
  const flag = window.localStorage.getItem(WELCOME_FLAG) === "1";
  if (flag) window.localStorage.removeItem(WELCOME_FLAG);
  return flag;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setHydrated(true);
    const handler = () => setUser(getUser());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { user, hydrated };
}
