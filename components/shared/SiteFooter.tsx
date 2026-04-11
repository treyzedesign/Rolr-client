export function SiteFooter() {
  return (
    <footer className="border-t border-blue-100 bg-white px-4 py-8 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
          Work<span className="text-blue-600">Swipe</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} WorkSwipe. Hiring, simplified.
        </p>
      </div>
    </footer>
  );
}
