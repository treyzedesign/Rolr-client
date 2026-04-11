"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { EmployerNavbar } from "@/components/employer/EmployerNavbar";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <ProtectedRoute role="employer">
      <div className="min-h-full flex flex-col">
        <EmployerNavbar onMobileMenuToggle={handleMobileMenuToggle} />
        <div className="flex flex-1">
          <EmployerSidebar 
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMobileMenuClose}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
