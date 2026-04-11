"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu, Briefcase, User, Search, FileText, Settings, Home } from "lucide-react";

const candidateNavItems = [
  { href: "/candidate", label: "Dashboard", icon: Home },
  { href: "/candidate/profile", label: "My Profile", icon: User },
  { href: "/candidate/discover", label: "Discover Jobs", icon: Search },
  { href: "/candidate/applications", label: "My Applications", icon: FileText },
  { href: "/candidate/settings", label: "Settings", icon: Settings },
];

interface JobSeekerSidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export function JobSeekerSidebar({ isMobileMenuOpen, onMobileMenuClose }: JobSeekerSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 h-full w-64 transform border-r border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-950
        transition-transform duration-300 ease-in-out
        md:relative md:z-auto md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-blue-100 dark:border-slate-800 md:hidden">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            Work<span className="text-blue-600">Swipe</span>
          </h2>
          <button
            onClick={onMobileMenuClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 h-screen overflow-y-auto">
          <h3 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Job Seeker Portal
          </h3>
          <ul className="space-y-1">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileMenuClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-300"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
