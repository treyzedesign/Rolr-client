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
            <div className="w-full px-6 py-6 md:py-8 md:pr-12 md:pl-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
