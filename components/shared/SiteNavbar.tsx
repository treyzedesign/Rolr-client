import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQs" },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Work<span className="text-blue-600">Swipe</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-700 dark:text-slate-200 dark:hover:text-sky-300"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
