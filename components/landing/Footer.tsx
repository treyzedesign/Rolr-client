import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            Work<span className="text-sky-400">Swipe</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Swipe-based discovery, voice-aware screening, and real-time
            collaboration for modern hiring teams.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400"
          aria-label="Footer"
        >
          <a href="#features" className="hover:text-white">
            Product
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-white">
            Register
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-slate-600 md:text-left">
        © {new Date().getFullYear()} WorkSwipe. All rights reserved.
      </p>
    </footer>
  );
}
