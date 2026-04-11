"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuthStore } from "@/stores/auth-store";

interface EmployerRegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  business_name: string;
  industry: string;
  phone?: string;
  website_url?: string;
  cac_number?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  expected_hiring_timeline?: "immediate" | "week_1" | "week_2" | "week_4" | "flex";
}

const HIRING_TIMELINES = [
  { value: "immediate", label: "Immediate" },
  { value: "week_1", label: "Within 1 week" },
  { value: "week_2", label: "Within 2 weeks" },
  { value: "week_4", label: "Within 1 month" },
  { value: "flex", label: "Flexible" },
];

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { registerEmployer, isLoading, error } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmployerRegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    business_name: "",
    industry: "",
    phone: "",
    website_url: "",
    cac_number: "",
    contact_person_name: "",
    contact_person_role: "",
    expected_hiring_timeline: "flex",
  });

  const handleInputChange = (field: keyof EmployerRegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.business_name.trim()) {
      return "Business name is required";
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
    if (!formData.industry.trim()) {
      return "Industry is required";
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const error = validateStep2();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await registerEmployer({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        business_name: formData.business_name.trim(),
        industry: formData.industry.trim(),
        phone: formData.phone?.trim(),
        website_url: formData.website_url?.trim(),
        cac_number: formData.cac_number?.trim(),
        contact_person_name: formData.contact_person_name?.trim(),
        contact_person_role: formData.contact_person_role?.trim(),
        expected_hiring_timeline: formData.expected_hiring_timeline,
      });
      toast.success("Registration successful! Please check your email for verification.");
      router.push("/login");
    } catch {
      // Store handles error state.
    }
  };


  return (
    <AuthShell
      badge="Employer"
      title="Create your employer account"
      subtitle="Find talent that fits your needs with our swipe-based discovery"
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
              Company Details
            </span>
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
        {currentStep === 1 && (
          /* Step 1: Basic Information */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Basic Information</h3>
            
            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">First name</span>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  required
                  placeholder="John"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Last name</span>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  required
                  placeholder="Doe"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </label>
            </div> */}
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Business name *</span>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => handleInputChange("business_name", e.target.value)}
                required
                placeholder="Tech Solutions Ltd"
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
                placeholder="john@company.com"
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
          /* Step 2: Company Information */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Company Information</h3>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Industry *</span>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                required
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="consulting">Consulting</option>
                <option value="media">Media & Entertainment</option>
                <option value="real-estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <span className="mb-1 block text-sm text-slate-300">Website URL (optional)</span>
                <input
                  type="url"
                  value={formData.website_url || ""}
                  onChange={(e) => handleInputChange("website_url", e.target.value)}
                  placeholder="https://company.com"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">CAC Registration Number (optional)</span>
              <input
                type="text"
                value={formData.cac_number || ""}
                onChange={(e) => handleInputChange("cac_number", e.target.value)}
                placeholder="RC1234567"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>
          </div>
        )}

        {currentStep === 2 && (
          /* Step 2: Contact Information */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Contact Information</h3>
            
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Contact person name (optional)</span>
              <input
                type="text"
                value={formData.contact_person_name || ""}
                onChange={(e) => handleInputChange("contact_person_name", e.target.value)}
                placeholder="HR Manager name"
                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Contact person role (optional)</span>
                <input
                  type="text"
                  value={formData.contact_person_role || ""}
                  onChange={(e) => handleInputChange("contact_person_role", e.target.value)}
                  placeholder="HR Manager"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Expected hiring timeline</span>
                <select
                  value={formData.expected_hiring_timeline || ""}
                  onChange={(e) => handleInputChange("expected_hiring_timeline", e.target.value as any)}
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-300 transition focus:ring"
                >
                  {HIRING_TIMELINES.map((timeline) => (
                    <option key={timeline.value} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
          Looking for a job?{" "}
          <Link href="/register/job-seeker" className="font-semibold text-sky-300 hover:text-sky-200">
            Create job seeker account
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
