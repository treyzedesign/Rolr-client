import Link from "next/link";

export function CTABanner() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl  border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-sky-100 p-10 shadow-[0_0_80px_-20px_rgba(56,189,248,0.25)] sm:p-14 md:p-16">
        <div className="mx-auto max-w-2xl  text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Ready to shorten the path from interest to interview?
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            Connect your existing API — then ship a swipe-native experience your
            users will actually enjoy.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-sky-50"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-8 py-3.5 text-base font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              I already have access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
