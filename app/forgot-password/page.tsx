"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
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
    
    // Basic validation
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

  if (isSubmitted) {
    return (
      <AuthShell
        badge="Check your email"
        title="Reset code sent"
        subtitle="We've sent a 6-digit code to your email address."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-300">
              If an account with this email exists, a password reset code has been sent to{" "}
              <span className="font-semibold">{email}</span>
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="inline-block rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 font-semibold text-white"
            >
              Enter Reset Code
            </Link>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-sm text-sky-300 hover:text-sky-200"
            >
              Try a different email
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Reset Password"
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a code to reset your password."
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
        
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="glow-ring w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}
