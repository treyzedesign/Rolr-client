"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/auth";
import { isUserAuthenticated, getUserRole } from "@/lib/auth-helpers";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  allowedRoles = ["job_seeker", "employer"], 
  redirectTo = "/login" 
}: RouteGuardProps) {
  const router = useRouter();
  const { user, token, fetchCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Quick check using cookies first
      if (!isUserAuthenticated()) {
        router.push(redirectTo);
        return;
      }

      // Get user role from cookies
      const userRole = getUserRole();
      if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
        // User is logged in but not authorized for this route
        const fallbackRoute = userRole === "employer" ? "/employer" : "/candidate";
        router.push(fallbackRoute);
        return;
      }

      // If we don't have user in store, fetch it
      if (!user) {
        try {
          await fetchCurrentUser();
        } catch {
          // If fetch fails, redirect to login
          router.push(redirectTo);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [token, user, allowedRoles, redirectTo, router, fetchCurrentUser]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sky-300 border-t-transparent"></div>
          <p className="text-slate-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show children only if authorized
  return isAuthorized ? <>{children}</> : null;
}
