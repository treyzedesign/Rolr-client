"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, user,  } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // hydrateAuthHeader();
    if (user?.role === "employer") {
      setIsRedirecting(true);
      router.replace("/employer");
    } else if (user?.role === "job_seeker") {
      setIsRedirecting(true);
      router.replace("/candidate");
    }
  }, [router, user?.role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      // Router will handle redirection based on user role in useEffect
    } catch {
      // Store handles error state.
    }
  };

  if (isRedirecting) {
    return (
      <AuthShell
        badge="Loading..."
        title="Signing you in"
        subtitle="Taking you to your dashboard..."
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sky-300 border-t-transparent"></div>
          <p className="text-slate-300">Preparing your workspace...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Sign in"
      title="Welcome back to WorkSwipe"
      subtitle="Access your dashboard and continue your journey."
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
          <span className="mb-1 block text-sm text-slate-300">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            placeholder="Enter your password"
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
          disabled={isLoading || !email.trim() || !password.trim()}
          className="glow-ring w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Link 
            href="/forgot-password" 
            className="text-sm text-sky-300 hover:text-sky-200"
          >
            Forgot your password?
          </Link>
        </div>
        
        <p className="text-sm text-slate-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-sky-300 hover:text-sky-200">
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
