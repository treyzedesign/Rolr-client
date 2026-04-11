import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function AccountNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Work<span className="text-blue-600">Swipe</span>
          <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300">
            Account
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {/* <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-sky-300"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-sky-300"
          >
            Register
          </Link>
          <Link
            href="/employer/discover"
            className="text-sm font-medium text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-sky-300"
          >
            Employer
          </Link> */}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
