"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthShell
      badge="Get Started"
      title="Join WorkSwipe"
      subtitle="Choose your path to connect with opportunities"
    >
      <div className="space-y-8">
        {/* Registration Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Job Seeker Option */}
          <Link
            href="/register/job-seeker"
            className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sky-100 p-4 group-hover:bg-sky-200 transition-colors">
                <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A7.977 7.977 0 0112.986 5.25c-3.724 0-6.745 2.882-6.745 6.44 0 3.558 3.021 6.44 6.745 6.44a6.744 6.744 0 016.745-6.44A7.977 7.977 0 0121 13.255zM12.986 17.5a2.245 2.245 0 01-2.245-2.245 2.245 2.245 0 012.245 2.245zm4.5-4.5a2.245 2.245 0 11-4.49 0 2.245 2.245 0 014.49 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Job Seeker
              </h3>
              <p className="text-sm text-slate-600">
                Find your dream job with AI-powered matching and swipe-based discovery.
              </p>
              <div className="mt-4 text-sm font-medium text-sky-600 group-hover:text-sky-700">
                Create account →
              </div>
            </div>
          </Link>

          {/* Employer Option */}
          <Link
            href="/register/employer"
            className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 p-4 group-hover:bg-blue-200 transition-colors">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Employer
              </h3>
              <p className="text-sm text-slate-600">
                Find talent that fits your needs with our innovative discovery platform.
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Create account →
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Information */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6">
          <h4 className="mb-3 font-semibold text-blue-900">Why choose WorkSwipe?</h4>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414 0z" clipRule="evenodd" />
              </svg>
              <span>AI-powered matching algorithm</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 000 1.414l2 2A1 1 0 001.414 0z" clipRule="evenodd" />
              </svg>
              <span>Swipe-based discovery interface</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 000 1.414l2 2A1 1 0 001.414 0z" clipRule="evenodd" />
              </svg>
              <span>Secure and verified profiles</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 000 1.414l2 2A1 1 0 001.414 0z" clipRule="evenodd" />
              </svg>
              <span>Real-time notifications</span>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
