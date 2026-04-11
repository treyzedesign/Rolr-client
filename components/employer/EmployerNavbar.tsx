"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuthStore } from "@/stores/auth-store";
import { Menu, LogOut, User } from "lucide-react";

interface EmployerNavbarProps {
  onMobileMenuToggle: () => void;
}

export function EmployerNavbar({ onMobileMenuToggle }: EmployerNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 bottom-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/employer"
          className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Work<span className="text-blue-600">Swipe</span>
          <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300">
            Employer
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* User menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <User className="h-4 w-4" />
              <span className="truncate max-w-32">
                {user?.fullName || user?.email || "User"}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-blue-100 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu toggle button */}
          <button
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
