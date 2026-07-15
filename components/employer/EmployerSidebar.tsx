"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { 
  X, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  Building2, 
  Settings, 
  LogOut 
} from "lucide-react";

const employerNavItems = [
  { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/applicants", label: "Candidates", icon: Users },
  { href: "/employer/interviews", label: "Interviews", icon: Calendar },
  { href: "/employer/profile", label: "Company Profile", icon: Building2 },
  { href: "/employer/settings", label: "Settings", icon: Settings },
];

interface EmployerSidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export function EmployerSidebar({ isMobileMenuOpen, onMobileMenuClose }: EmployerSidebarProps) {
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
        md:m-6 md:rounded-[2.2rem] md:border md:border-slate-100 md:shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:md:border-slate-800/80
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center pt-9 pb-8 px-6 select-none">
          <img src="/Assets/logo1.png" alt="ROLr Logo" className="h-10 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col justify-between h-[calc(100%-9rem)] px-5">
          <div className="space-y-1 overflow-y-auto py-1">
            <ul>
              {employerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/employer" && pathname?.startsWith(item.href));
                
                return (
                  <li key={item.href} className="mb-2">
                    <Link
                      href={item.href}
                      onClick={onMobileMenuClose}
                      className={`
                        relative flex items-center gap-3.5 py-3 px-5 text-sm font-semibold transition-all duration-200 group rounded-xl
                        ${isActive 
                          ? "bg-blue-50/50 text-blue-600 dark:bg-blue-955/20 dark:text-blue-400 pl-[22px]" 
                          : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200"
                        }
                      `}
                    >
                      {/* Left indicator bar matching the exact design */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] rounded-r-md bg-blue-600 dark:bg-blue-500" />
                      )}
                      
                      <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-450 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Gray dividing line below settings */}
            <div className="border-t border-slate-200 dark:border-slate-800/80 my-5 mx-2" />
          </div>

          {/* Logout Section - Aligned centered at the bottom */}
          <div className="pb-8 pt-4 flex justify-center w-full">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-red-500 hover:bg-red-50/50 rounded-xl transition-all duration-200 cursor-pointer select-none border-none bg-transparent w-full"
            >
              {/* Custom Red Logout Door/Arrow Icon */}
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile close button inside the sidebar */}
        <button
          onClick={onMobileMenuClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden cursor-pointer border-none bg-transparent"
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
                className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full py-2.5 text-xs font-bold transition-all border-none cursor-pointer text-center"
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
