"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useEffect } from "react";

interface JobSeekerNavbarProps {
  onMobileMenuToggle: () => void;
}

export function JobSeekerNavbar({ onMobileMenuToggle }: JobSeekerNavbarProps) {
  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  return (
    <header className="md:hidden sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90 h-16 flex items-center justify-between px-4 select-none">
      {/* Left side: Menu toggle & ROLr Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* ROLr Logo */}
        <img src="/Assets/logo1.png" alt="ROLr Logo" className="h-7 object-contain ml-1" />
      </div>

      {/* Right side: Bell & Profile avatar */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 shadow-xs">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-955">
            6
          </span>
        </button>

        {/* Profile Avatar Widget */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-slate-250/20">
          {candidateProfile?.profile_image_url ? (
            <img 
              src={candidateProfile.profile_image_url} 
              alt="avatar" 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            candidateName.charAt(0).toUpperCase()
          )}
          {/* Green Status indicator dot */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"></span>
        </div>
      </div>
    </header>
  );
}
