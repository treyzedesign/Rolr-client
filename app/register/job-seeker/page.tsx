"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuthStore } from "@/stores/auth-store";

interface JobSeekerRegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  phone?: string;
  identity?: string;
  job_category?: string;
  experience_level?: "entry" | "mid" | "senior";
  employment_status?: string;
}

export default function JobSeekerRegisterPage() {
  const router = useRouter();
  const { registerJobSeeker, isLoading, error } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobSeekerRegisterForm>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phone: "",
    job_category: "",
    experience_level: "entry",
    employment_status: "",
  });

  const handleInputChange = (field: keyof JobSeekerRegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.full_name.trim()) {
      return "Full name is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
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

  const validateStep2 = () => {
    if (!formData.location.trim()) {
      return "Location is required";
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      // You could set an error state here instead of alert
      alert(error);
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuccess(false);
    
    const error = validateStep2();
    if (error) {
      alert(error);
      return;
    }

    try {
      await registerJobSeeker({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        location: formData.location.trim(),
        phone: formData.phone?.trim(),
        job_category: formData.job_category?.trim(),
        experience_level: formData.experience_level,
        employment_status: formData.employment_status?.trim(),
      });
      setShowSuccess(true);
    } catch {
      // Store handles error state.
    }
  };

  if (showSuccess) {
    return (
      <AuthShell
        badge="Check your email"
        title="Registration successful!"
        subtitle="We've sent a verification email to complete your registration."
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 p-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Check your inbox</h3>
            <p className="text-slate-600">
              We've sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Click the verification link in the email to activate your account and start your job search.
            </p>
          </div>
          
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Check your email inbox (including spam folder)</li>
              <li>Click the verification link</li>
              <li>Return here to log in</li>
            </ol>
          </div>

          <div className="pt-4">
            <Link 
              href="/login" 
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Go to login
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Job Seeker"
      title="Create your job seeker account"
      subtitle="Start your journey with AI-powered job matching"
    >
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Basic Info
            </span>
          </div>
          <div className="flex-1 mx-4">
            <div className={`h-1 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          </div>
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Professional Details
            </span>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
        {currentStep === 1 && (
          /* Step 1: Basic Information */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Basic Information</h3>
            
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Full name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Email address</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="john@example.com"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="Create a strong password"
                minLength={8}
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Confirm password</span>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>
          </div>
        )}

        {currentStep === 2 && (
          /* Step 2: Professional Information */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Professional Information</h3>
            
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Location *</span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
                placeholder="Lagos, Nigeria"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Phone number (optional)</span>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>
            
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Job category (optional)</span>
              <select
                value={formData.job_category || ""}
                onChange={(e) => handleInputChange("job_category", e.target.value)}
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              >
                <option value="">Select job category</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="customer-service">Customer Service</option>
                <option value="operations">Operations</option>
                <option value="hr">Human Resources</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Experience level (optional)</span>
                <select
                  value={formData.experience_level || ""}
                  onChange={(e) => handleInputChange("experience_level", e.target.value as "entry" | "mid" | "senior")}
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Employment status (optional)</span>
                <select
                  value={formData.employment_status || ""}
                  onChange={(e) => handleInputChange("employment_status", e.target.value)}
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                >
                  <option value="">Select status</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep === 2 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
          )}
          
          <button
            type={currentStep === 1 ? "button" : "submit"}
            onClick={currentStep === 1 ? handleNextStep : undefined}
            disabled={isLoading}
            className="glow-ring flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : currentStep === 1 ? "Next Step" : "Create account"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Are you an employer?{" "}
          <Link href="/register/employer" className="font-semibold text-sky-300 hover:text-sky-200">
            Create employer account
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
