"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { hydrateAuthState } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookies on mount
    hydrateAuthState();
  }, [hydrateAuthState]);

  return <>{children}</>;
}
