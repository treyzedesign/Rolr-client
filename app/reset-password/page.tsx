"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get email from URL params
  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email.trim() || !otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 8) {
      return;
    }

    try {
      await resetPassword({ 
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      setIsSuccess(true);
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
          {isSuccess ? (
            <div className="animate-fadeIn text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center p-4 shadow-sm">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Password Reset Complete
                </h1>
                <p className="text-sm font-semibold text-slate-500 leading-normal">
                  Your password has been successfully reset.
                </p>
              </div>

              <div className="rounded-2xl border border-green-50 bg-green-50/20 p-6 text-left">
                <p className="text-xs font-semibold text-green-800 leading-relaxed">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
              </div>
              
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="w-full py-4 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* Mail/Lock Icon rounded border container */}
              <div className="mx-auto w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center p-3 mb-6 bg-white shadow-sm">
                <img 
                  src="/Assets/mail_pic.png" 
                  alt="Reset Password" 
                  className="w-8 h-8 object-contain select-none pointer-events-none" 
                />
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                Reset Password
              </h1>
              
              <p className="mt-2 text-sm font-semibold text-slate-400 text-center leading-normal">
                Create a new password and confirm to continue
              </p>

              <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
                {/* Email Field (disabled, prefilled) */}
                <div className="text-left">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled
                    value={email}
                    placeholder="jetty@mail.com"
                    className="w-full px-5 py-4 rounded-2xl bg-[#f5f6f8]/70 border-none text-slate-400 placeholder-slate-400 font-semibold cursor-not-allowed text-sm"
                  />
                </div>

                {/* Reset Code Field (required for validation) */}
                <div className="text-left">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Input reset code"
                    className="w-full px-5 py-4 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm font-mono tracking-widest text-center"
                  />
                </div>

                {/* New Password Field */}
                <div className="text-left">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Input new password"
                      className="w-full px-5 py-4 pr-12 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="text-left">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-5 py-4 pr-12 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Match error validation check */}
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-2 text-xs font-semibold text-rose-500 text-left animate-slideDown">
                      Passwords do not match
                    </p>
                  )}

                  {/* Password Length error validation check */}
                  {newPassword && newPassword.length < 8 && (
                    <p className="mt-2 text-xs font-semibold text-amber-600 text-left animate-slideDown">
                      Password must be at least 8 characters long
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left">
                    <p className="text-xs font-semibold text-rose-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isLoading || 
                    !email.trim() || 
                    !otp.trim() || 
                    !newPassword.trim() || 
                    !confirmPassword.trim() ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                  }
                  className="w-full py-4 mt-2 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Resetting..." : "Set Password"}
                </button>
              </form>

              <div className="mt-8 text-center space-y-4">
                <div>
                  <Link 
                    href={`/forgot-password?email=${encodeURIComponent(email)}`}
                    className="text-xs font-bold text-[#2782FF] hover:underline transition-all"
                  >
                    Didn't receive the code? Resend
                  </Link>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Remember your password?
                    <Link href="/login" className="text-[#2782FF] hover:underline font-bold transition-all ml-1">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col p-6 sm:p-10 relative font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2782FF]"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
