import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-100/70 via-white to-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-sky-500/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[90px]"
      />
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
          Recruitment reimagined
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Swipe into your{" "}
          <span className="text-gradient-brand">next role</span>
          <br className="hidden sm:block" /> — or your next hire.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          A fast, visual discovery layer for jobs and talent. Voice screening and
          instant messaging activate the moment both sides swipe right.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/register"
            className="glow-ring inline-flex min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-950 shadow-xl transition hover:bg-sky-50"
          >
            Start swiping
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-blue-200 bg-white px-8 py-3.5 text-base font-semibold text-blue-700 backdrop-blur-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            See how it works
          </Link>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-blue-100 pt-10 sm:gap-8">
          {[
            { value: "3×", label: "Faster shortlists" },
            { value: "Voice", label: "First impressions" },
            { value: "Live", label: "Match messaging" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs text-slate-500 sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
