"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthBanner } from "@/components/auth/AuthBanner";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"job-seeker" | "employer">("job-seeker");

  const handleProceed = () => {
    router.push(`/register/${role}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex p-4 lg:p-6 gap-6 font-sans">
      <AuthBanner />

      {/* Right Panel - Selection form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[460px] flex flex-col text-center">
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#2782FF]">
              Rolr
            </Link>
          </div>

          {/* Header block */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Join Rolr
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-500 leading-normal">
              Choose your path to connect with opportunities
            </p>
          </div>

          {/* Cards Stack */}
          <div className="space-y-5">
            {/* Job Seeker Option Card */}
            <div
              onClick={() => setRole("job-seeker")}
              className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer select-none ${
                role === "job-seeker"
                  ? "border-[#2782FF] bg-[#2782FF]/[0.02] shadow-[0_4px_20px_rgba(39,130,255,0.08)]"
                  : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-300 ${
                    role === "job-seeker"
                      ? "bg-[#2782FF]/10 text-[#2782FF]"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Job Seeker
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 font-semibold leading-relaxed max-w-[280px]">
                    Find your dream job with AI-powered matching and swipe-based discovery
                  </p>
                </div>
              </div>

              {/* Custom Radio Button Circle */}
              <div
                className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  role === "job-seeker" ? "border-[#2782FF] bg-[#2782FF]" : "border-slate-200"
                }`}
              >
                {role === "job-seeker" && (
                  <div className="w-2 h-2 rounded-full bg-white animate-scaleIn" />
                )}
              </div>
            </div>

            {/* Employer Option Card */}
            <div
              onClick={() => setRole("employer")}
              className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer select-none ${
                role === "employer"
                  ? "border-[#2782FF] bg-[#2782FF]/[0.02] shadow-[0_4px_20px_rgba(39,130,255,0.08)]"
                  : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-300 ${
                    role === "employer"
                      ? "bg-[#2782FF]/10 text-[#2782FF]"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A7.977 7.977 0 0112.986 5.25c-3.724 0-6.745 2.882-6.745 6.44 0 3.558 3.021 6.44 6.745 6.44a6.744 6.744 0 016.745-6.44A7.977 7.977 0 0121 13.255z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Employer
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 font-semibold leading-relaxed max-w-[280px]">
                    Find talents that fits your needs with our innovative discovery platform
                  </p>
                </div>
              </div>

              {/* Custom Radio Button Circle */}
              <div
                className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  role === "employer" ? "border-[#2782FF] bg-[#2782FF]" : "border-slate-200"
                }`}
              >
                {role === "employer" && (
                  <div className="w-2 h-2 rounded-full bg-white animate-scaleIn" />
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleProceed}
            className="w-full py-4 mt-8 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] cursor-pointer"
          >
            Proceed
          </button>

          {/* Footer Text */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-500">
              Already have an account?
              <Link href="/login" className="text-[#2782FF] hover:underline font-bold transition-all ml-1">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
