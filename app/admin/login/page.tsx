"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading, error, user, token, setError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!token || !user?.role) return;
    if (user?.role === "admin") {
      setIsRedirecting(true);
      router.replace("/admin");
    } else {
      // Non-admin users should use the main login page
      setIsRedirecting(true);
      router.replace("/login");
    }
  }, [router, token, user?.role]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    await login({ 
      email: email.trim().toLowerCase(), 
      password 
    });
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-400"></div>
          <p className="text-cyan-400 text-lg font-medium">Accessing Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg shadow-cyan-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Secure access to WorkSwipe administration</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
            <span className="text-xs text-slate-500 uppercase tracking-widest">Authentication</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Admin Email
              </label>
              <div className="relative">
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  required
                  type="email"
                  placeholder="admin@workswipe.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !email.trim() || !password.trim()}
              className="group w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-3">
          <Link 
            href="/forgot-password" 
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Forgot password?
          </Link>
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-sm text-slate-500">
              Not an admin?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                User Login
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Return to{" "}
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                WorkSwipe Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
