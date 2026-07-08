"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get email from URL params if present
  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await forgotPassword({ 
        email: email.trim().toLowerCase() 
      });
      setIsSubmitted(true);
    } catch {
      // Store handles error state.
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col p-6 sm:p-10 relative font-sans">
      {/* Brand logo at top left */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-[#2782FF]">
          Rolr
        </Link>
      </div>

      {/* Main card box container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[480px] bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-slate-100/50 flex flex-col">
          {isSubmitted ? (
            <div className="animate-fadeIn">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center p-4 mb-6 shadow-sm">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                Reset Code Sent
              </h1>
              
              <p className="mt-2 text-sm font-semibold text-slate-400 text-center leading-normal">
                We've sent a 6-digit code to your email address.
              </p>

              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-blue-50 bg-[#2782FF]/[0.02] p-6 text-left">
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                    If an account with this email exists, a password reset code has been sent to{" "}
                    <strong className="text-slate-800 font-bold">{email}</strong>.
                  </p>
                </div>
                
                <Link 
                  href={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="w-full py-4 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  Enter Reset Code
                </Link>
                
                <div className="text-center">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* Key Icon rounded border container */}
              <div className="mx-auto w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center p-3 mb-6 bg-white shadow-sm">
                <img src="/Assets/key_icon.png" alt="Key" className="w-8 h-8 object-contain select-none pointer-events-none" />
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                Forgot Password
              </h1>
              
              <p className="mt-2 text-sm font-semibold text-slate-400 text-center leading-normal">
                Enter your email to reset your password
              </p>

              <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
                <div className="text-left">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    placeholder="Input your email"
                    className="w-full px-5 py-4 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
                  />
                </div>
                
                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left">
                    <p className="text-xs font-semibold text-rose-600">{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-4 mt-2 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Remembered your password?
                  <Link href="/login" className="text-[#2782FF] hover:underline font-bold transition-all ml-1">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col p-6 sm:p-10 relative font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2782FF]"></div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
