import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-16 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-black p-12 sm:p-16 shadow-xl flex items-center justify-center min-h-[340px]">
          {/* Left blue arcs background */}
          <img
            src="/Assets/triple_left_arcs.png"
            alt=""
            className="absolute left-0 top-0 bottom-0 h-full w-auto object-contain select-none pointer-events-none opacity-85 z-0"
          />

          {/* Right blue arcs background */}
          <img
            src="/Assets/triple_right_arcs.png"
            alt=""
            className="absolute right-0 top-0 bottom-0 h-full w-auto object-contain select-none pointer-events-none opacity-85 z-0"
          />

          {/* Content Block */}
          <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center">
            <h2 className="font-sans text-3xl font-extrabold text-white sm:text-4xl leading-tight">
              Ready to shorten the path from interest to interview?
            </h2>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl">
              Connect your existing API — then ship a swipe-native experience your users will actually enjoy.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#2782FF] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1a73e8] hover:-translate-y-0.5 active:scale-95 shadow-md shadow-blue-500/10"
              >
                Start Swiping
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#2782FF]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
