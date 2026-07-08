"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { AuthBanner } from "@/components/auth/AuthBanner";
import toast from "react-hot-toast";

interface JobSeekerRegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
}

export default function JobSeekerRegisterPage() {
  const router = useRouter();
  const { registerJobSeeker, isLoading, error } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    isValidLength: false,
    passwordsMatch: false,
  });

  const [formData, setFormData] = useState<JobSeekerRegisterForm>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "Lagos, Nigeria", // Provide default location as required by Backend API
  });

  const handleInputChange = (field: keyof JobSeekerRegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time password validation
    if (field === "password" || field === "confirmPassword") {
      const password = field === "password" ? value : formData.password;
      const confirmPassword = field === "confirmPassword" ? value : formData.confirmPassword;

      setPasswordValidation({
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSymbol: /[^A-Za-z0-9]/.test(password),
        isValidLength: password.length >= 8,
        passwordsMatch: password === confirmPassword && password.length > 0,
      });
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      return "Full name is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address";
    }

    const email = formData.email.trim().toLowerCase();
    if (email.startsWith(".") || email.startsWith("_") || email.endsWith(".")) {
      return "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      return "Password is required";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const isStep1Complete = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = formData.email.trim().toLowerCase();

    return (
      formData.full_name.trim() &&
      formData.email.trim() &&
      emailRegex.test(formData.email.trim()) &&
      !email.startsWith(".") &&
      !email.startsWith("_") &&
      !email.endsWith(".") &&
      formData.password.trim() &&
      formData.password.length >= 8 &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await registerJobSeeker({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        location: formData.location.trim(),
      });
      setShowSuccess(true);
    } catch {
      // Store handles error state and triggers toast notification.
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex p-4 lg:p-6 gap-6 font-sans">
      {/* Reusable Left Panel - Brand Banner */}
      <AuthBanner />

      {/* Right Panel - Form / Success card */}
      {showSuccess ? (
        <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative animate-fadeIn">
          <div className="w-full max-w-[460px] flex flex-col text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center p-4 shadow-sm">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registration successful!</h2>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                We've sent a verification email to <strong className="text-slate-800 font-bold">{formData.email}</strong>.
              </p>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Click the verification link in the email to activate your account and start your job search.
              </p>
            </div>
            
            <div className="rounded-2xl border border-blue-50 bg-[#2782FF]/[0.02] p-6 text-left">
              <p className="text-sm font-bold text-[#2782FF]">
                Next steps:
              </p>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-xs font-semibold text-slate-600">
                <li>Check your email inbox (including spam folder)</li>
                <li>Click the verification link</li>
                <li>Return here to log in</li>
              </ol>
            </div>

            <div className="pt-4">
              <Link 
                href="/login" 
                className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#2782FF] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-95"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative">
          {/* Mobile Header Logo */}
          <div className="lg:hidden absolute top-8 left-8">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#2782FF]">
              Rolr
            </Link>
          </div>

          <div className="w-full max-w-[460px] flex flex-col">
            {/* Header block */}
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Your Job Seeker Account
              </h1>
              <p className="mt-3 text-sm font-semibold text-slate-500 leading-normal">
                Start your journey with AI-powered job matching
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Jetty Connor"
                  className="w-full px-5 py-4 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="jetty@gmail.com"
                  className="w-full px-5 py-4 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Jeetty666"
                    className="w-full px-5 py-4 pr-12 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
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

              {/* Confirm Password */}
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Jeetty666"
                    className="w-full px-5 py-4 pr-12 rounded-2xl bg-[#f5f6f8] border-none text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2782FF] transition-all text-sm"
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

                {/* Error validation message */}
                {formData.confirmPassword && !passwordValidation.passwordsMatch && (
                  <p className="mt-2 text-xs font-semibold text-rose-500 text-left animate-slideDown">
                    Password does not match
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left">
                  <p className="text-xs font-semibold text-rose-600">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !isStep1Complete()}
                className="w-full py-4 mt-2 rounded-full bg-[#2782FF] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-[#1a73e8] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-8 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Already have an account?
                <Link href="/login" className="text-[#2782FF] hover:underline font-bold transition-all ml-1">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
