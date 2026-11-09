"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { 
  X, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  FileCheck,
  Award 
} from "lucide-react";

const candidateNavItems = [
  { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/discover", label: "Jobs", icon: Briefcase },
  { href: "/candidate/applications", label: "My Applications", icon: FileText },
  { href: "/candidate/interviews", label: "Interviews", icon: Calendar },
  { href: "/candidate/offers", label: "Job Offers", icon: Award },
  { href: "/candidate/engagements", label: "My Engagements", icon: FileCheck },
  { href: "/candidate/profile", label: "My Profile", icon: User },
  { href: "/candidate/settings", label: "Settings", icon: Settings },
];

interface JobSeekerSidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export function JobSeekerSidebar({ isMobileMenuOpen, onMobileMenuClose }: JobSeekerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
    onMobileMenuClose();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 h-full w-64 transform bg-white dark:bg-slate-900
        transition-transform duration-300 ease-in-out
        md:sticky md:top-6 md:z-auto md:h-[calc(100vh-3rem)] md:translate-x-0
        md:m-6 md:rounded-[2rem] md:border md:border-slate-100 md:shadow-sm dark:md:border-slate-800/80
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6">
          <div className="flex items-center gap-1 select-none">
            <img src="/Assets/logo1.png" alt="ROLr Logo" className="h-9 object-contain" />
          </div>
          {/* <span className="text-[8px] font-bold tracking-widest text-blue-500 uppercase mt-2">
            SWIPE. MATCH. GET HIRED.
          </span> */}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col justify-between h-[calc(100%-8rem)] px-4">
          <div className="space-y-1.5 overflow-y-auto py-2">
            <ul>
              {candidateNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/candidate" && pathname?.startsWith(item.href));
                
                return (
                  <li key={item.href} className="mb-1">
                    <Link
                      href={item.href}
                      onClick={onMobileMenuClose}
                      className={`
                        relative flex items-center gap-3 py-3 px-4 text-sm font-semibold transition-all duration-200 group
                        ${isActive 
                          ? "bg-blue-50/70 text-blue-600 border-l-[3px] border-blue-600 rounded-r-xl rounded-l-none pl-[13px] dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-500" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                        }
                      `}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Separator line */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 my-4" />
          </div>

          {/* Logout Section */}
          <div className="pb-6">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center gap-3 py-3 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer select-none border-none bg-transparent"
            >
              <LogOut className="h-4.5 w-4.5 text-red-500 dark:text-red-400" />
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile close button inside the sidebar */}
        <button
          onClick={onMobileMenuClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] shadow-2xl p-7 max-w-sm w-full mx-4 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-semibold text-slate-850 dark:text-slate-100 text-base">
                Account Logout
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Are you sure you want to logout of your account?
              </p>
            </div>
            <div className="flex gap-4 w-full pt-1.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full py-2.5 text-xs font-bold transition-all border-none cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full py-2.5 text-xs font-bold transition-all border-none cursor-pointer text-center active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
