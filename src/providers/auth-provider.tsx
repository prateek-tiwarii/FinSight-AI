"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthMeResponse,
  GuestCounts,
  UserPublic,
} from "@/types/api";
import {
  continueAsGuest,
  convertGuestSession,
  getAuthMe,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "@/lib/api";

export type AuthMode = "login" | "register";

type AuthContextValue = {
  status: "loading" | "anonymous" | "guest" | "authenticated";
  me: AuthMeResponse | null;
  user: UserPublic | null;
  guestCounts: GuestCounts | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  convertGuest: (confirmMerge: boolean) => Promise<void>;
  authDialogOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setAuthMode: (mode: AuthMode) => void;
  conversionOpen: boolean;
  openConversion: () => void;
  closeConversion: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveStatus(me: AuthMeResponse | null): AuthContextValue["status"] {
  if (!me) return "loading";
  if (me.user) return "authenticated";
  if (me.guest) return "guest";
  return "anonymous";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [conversionOpen, setConversionOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getAuthMe();
      setMe(data);
      if (data.guest_conversion_available && data.user) {
        setConversionOpen(true);
      }
    } catch {
      setMe({ authenticated: false, guest_conversion_available: false });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginAccount({ email, password });
    setMe({
      authenticated: true,
      user: result.user,
      guest: null,
      guest_conversion_available: result.guest_conversion_available,
      guest_counts: result.guest_counts ?? null,
    });
    setAuthDialogOpen(false);
    if (result.guest_conversion_available) setConversionOpen(true);
  }, []);

  const register = useCallback(
    async (payload: {
      full_name: string;
      email: string;
      password: string;
      confirm_password: string;
    }) => {
      const result = await registerAccount(payload);
      setMe({
        authenticated: true,
        user: result.user,
        guest: null,
        guest_conversion_available: result.guest_conversion_available,
        guest_counts: result.guest_counts ?? null,
      });
      setAuthDialogOpen(false);
      if (result.guest_conversion_available) setConversionOpen(true);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutAccount();
    setConversionOpen(false);
    await refresh();
  }, [refresh]);

  const startGuest = useCallback(async () => {
    const result = await continueAsGuest();
    setMe(result);
    setAuthDialogOpen(false);
  }, []);

  const convertGuest = useCallback(
    async (confirmMerge: boolean) => {
      await convertGuestSession(confirmMerge);
      setConversionOpen(false);
      await refresh();
    },
    [refresh],
  );

  const openAuth = useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthDialogOpen(false), []);
  const openConversion = useCallback(() => setConversionOpen(true), []);
  const closeConversion = useCallback(() => setConversionOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: deriveStatus(me),
      me,
      user: me?.user ?? null,
      guestCounts: me?.guest_counts ?? null,
      refresh,
      login,
      register,
      logout,
      continueAsGuest: startGuest,
      convertGuest,
      authDialogOpen,
      authMode,
      openAuth,
      closeAuth,
      setAuthMode,
      conversionOpen,
      openConversion,
      closeConversion,
    }),
    [
      me,
      refresh,
      login,
      register,
      logout,
      startGuest,
      convertGuest,
      authDialogOpen,
      authMode,
      openAuth,
      closeAuth,
      conversionOpen,
      openConversion,
      closeConversion,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
