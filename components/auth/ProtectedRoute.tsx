"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  return (
    <RouteGuard allowedRoles={[role]}>
      {children}
    </RouteGuard>
  );
}
