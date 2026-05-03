"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
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
    
    // Basic validation
    if (!email.trim() || !otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return;
    }

    // Password match validation
    if (newPassword !== confirmPassword) {
      return;
    }

    // Password length validation
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

  if (isSuccess) {
    return (
      <AuthShell
        badge="Success"
        title="Password Reset Complete"
        subtitle="Your password has been successfully reset."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-300">
              Your password has been reset successfully. You can now login with your new password.
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href="/login"
              className="inline-block rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 font-semibold text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Reset Password"
      title="Enter reset code"
      subtitle="Enter the 6-digit code from your email and create your new password."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Email address</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            placeholder="john@example.com"
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">6-digit reset code</span>
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            type="text"
            placeholder="123456"
            maxLength={6}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring text-center text-lg font-mono"
          />
        </label>
        
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">New password</span>
          <div className="relative">
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              minLength={8}
              className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 pr-12 text-slate-900 outline-none ring-blue-300 transition focus:ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Confirm new password</span>
          <div className="relative">
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              minLength={8}
              className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 pr-12 text-slate-900 outline-none ring-blue-300 transition focus:ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20">
            <p className="text-sm text-rose-700 dark:text-rose-300">Passwords do not match</p>
          </div>
        )}

        {newPassword && newPassword.length < 8 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-700 dark:text-amber-300">Password must be at least 8 characters long</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
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
          className="glow-ring w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Link 
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="text-sm text-sky-300 hover:text-sky-200"
          >
            Didn't receive the code? Resend
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthShell
        badge="Loading"
        title="Loading..."
        subtitle="Please wait..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthShell>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
