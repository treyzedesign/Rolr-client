import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { href: "/", label: "Home", isActive: true },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQs" },
];

export function SiteNavbar() {
  return (
    <div className="w-full px-4 pt-6 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <header className="rounded-2xl border border-slate-100 bg-white/95 px-6 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-sans text-2xl font-bold tracking-tight text-[#2782FF]"
          >
            Rolr
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${item.isActive
                    ? "text-[#2782FF]"
                    : "text-slate-600 hover:text-[#2782FF] dark:text-slate-300 dark:hover:text-[#2782FF]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-[#2782FF] dark:text-slate-200 dark:hover:text-[#2782FF]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#2782FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a73e8] hover:shadow-md hover:shadow-blue-500/10 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
