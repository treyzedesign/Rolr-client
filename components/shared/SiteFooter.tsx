import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQs" },
];

export function SiteFooter() {
  return (
    <footer className="bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Upper footer block: Logo, nav, social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100 dark:border-slate-800/80">

          {/* Logo */}
          <Link
            href="/"
            className="font-sans text-2xl font-bold tracking-tight text-[#2782FF] select-none"
          >
            Rolr
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-500 hover:text-[#2782FF] dark:text-slate-400 dark:hover:text-[#2782FF] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2782FF] text-white hover:bg-[#1a73e8] hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Instagram"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2782FF] text-white hover:bg-[#1a73e8] hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="X (Twitter)"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2782FF] text-white hover:bg-[#1a73e8] hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
          </div>

        </div>

        {/* Lower footer block: Copyright */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Rolr Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
