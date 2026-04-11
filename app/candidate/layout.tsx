"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { JobSeekerNavbar } from "@/components/candidate/JobSeekerNavbar";
import { JobSeekerSidebar } from "@/components/candidate/JobSeekerSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <ProtectedRoute role="job_seeker">
      <div className="min-h-full flex flex-col">
        <JobSeekerNavbar onMobileMenuToggle={handleMobileMenuToggle} />
        <div className="flex flex-1">
          <JobSeekerSidebar 
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
