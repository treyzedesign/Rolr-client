import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f5f6f8] dark:bg-slate-950 pb-20 pt-10 transition-colors duration-300">
      {/* Background soft ambient glows for premium feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-[#2782FF]/5 blur-[100px] dark:bg-[#2782FF]/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#2782FF]/5 blur-[90px] dark:bg-[#2782FF]/10"
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 relative">
        {/* Background overlapping Ellipses */}
        <img
          src="/Assets/Ellipse 13.png"
          alt=""
          className="absolute left-[-2%] top-[8%] w-[68%] max-w-none h-auto object-contain select-none pointer-events-none z-0 opacity-100 dark:opacity-40"
        />
        <img
          src="/Assets/Ellipse 14.png"
          alt=""
          className="absolute left-[-4%] top-[12%] w-[72%] max-w-none h-auto object-contain select-none pointer-events-none z-0 opacity-100 dark:opacity-40"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column - Content */}
          <div className="flex flex-col text-left lg:col-span-7">
            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[54px] leading-[1.15] pb-1">
              <span className="bg-gradient-to-r from-[#1a365d] to-[#2782FF] bg-clip-text text-transparent dark:from-white dark:to-[#2782FF]">
                SWIPE INTO YOUR NEXT ROLE
              </span>
              <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-[#1a365d] to-[#2782FF] bg-clip-text text-transparent dark:from-white dark:to-[#2782FF]">
                OR YOUR NEXT HIRE!
              </span>
            </h1>
            
            <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              A fast, visual discovery layer for jobs and talent. Voice screening and
              automated AI assessment activate the moment both sides swipe right.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#2782FF] px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-[#1a73e8] hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                Start Swiping
              </Link>
              <Link
                href="/register"
                className="inline-flex min-w-[170px] items-center justify-center rounded-full border-2 border-[#2782FF] bg-transparent px-8 py-3 text-base font-semibold text-[#2782FF] transition-all hover:bg-blue-50/50 hover:-translate-y-0.5 active:scale-95 dark:hover:bg-blue-950/20"
              >
                Start Hiring
              </Link>
            </div>
          </div>

          {/* Right Column - Image Collage */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative w-full max-w-[500px] lg:max-w-none transition-all duration-700 hover:scale-[1.01]">
              <img
                src="/Assets/hero_pics_2.png"
                alt="Rolr App Experience"
                className="h-auto w-full object-contain select-none pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
              />
            </div>
          </div>

        </div>

        {/* Stats Section at the Bottom */}
        <div className="mx-auto mt-20 max-w-4xl border-t border-slate-200/60 pt-10 dark:border-slate-800/80">
          <div className="grid grid-cols-3 gap-4 text-center sm:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#2782FF] tracking-tight transition-transform duration-300 hover:scale-105">
                3x
              </span>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Faster shortlists
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#2782FF] tracking-tight transition-transform duration-300 hover:scale-105">
                Voice
              </span>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                First Impression
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#2782FF] tracking-tight transition-transform duration-300 hover:scale-105">
                AI
              </span>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Assessment
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
