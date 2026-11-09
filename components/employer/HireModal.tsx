"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import type { BillingCycle, CreateHireOfferRequest } from "@/types/hiring";
import toast from "react-hot-toast";

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle?: string;
  onSuccess?: (offer: any) => void;
}

export function HireModal({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle = "",
  onSuccess,
}: HireModalProps) {
  const { createHireOffer, isLoading } = useHiringStore();

  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "USD":
        return "$ USD";
      case "CAD":
        return "$ CAD";
      case "NGN":
        return "₦ NGN";
      case "GBP":
        return "£ GBP";
      case "EUR":
        return "€ EUR";
      default:
        return curr;
    }
  };

  const [role, setRole] = useState(jobTitle || "");
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("6 months");
  const [employerBillingRate, setEmployerBillingRate] = useState<string>("");
  const [jobSeekerPayoutRate, setJobSeekerPayoutRate] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [terms, setTerms] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobTitle && !role) {
      setRole(jobTitle);
    }
  }, [jobTitle]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!role.trim()) {
      newErrors.role = "Role title is required";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedStart = new Date(startDate);
      if (selectedStart < today) {
        newErrors.startDate = "Start date cannot be in the past";
      }
    }

    if (endDate && startDate) {
      const selectedStart = new Date(startDate);
      const selectedEnd = new Date(endDate);
      if (selectedEnd <= selectedStart) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    const billingRateNum = parseFloat(employerBillingRate);
    if (!employerBillingRate || isNaN(billingRateNum) || billingRateNum <= 0) {
      newErrors.employerBillingRate = "A valid positive billing rate is required";
    }

    const payoutRateNum = parseFloat(jobSeekerPayoutRate);
    if (!jobSeekerPayoutRate || isNaN(payoutRateNum) || payoutRateNum <= 0) {
      newErrors.jobSeekerPayoutRate = "A valid positive target payout rate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreateHireOfferRequest = {
        role: role.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        duration: duration.trim() || undefined,
        employerBillingRate: parseFloat(employerBillingRate),
        jobSeekerPayoutRate: parseFloat(jobSeekerPayoutRate),
        currency,
        billingCycle,
        terms: terms.trim() || undefined,
      };

      const result = await createHireOffer(applicationId, payload);
      if (onSuccess) {
        onSuccess(result.offer);
      }
      onClose();
    } catch (err) {
      // error toast handled in store
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Create Hire Offer
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For <span className="font-semibold text-slate-800 dark:text-slate-200">{candidateName}</span> via Rolr Bilateral Contracting
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner on Rolr Bilateral Contracting */}
          <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-blue-700 dark:text-blue-300">Rolr Contracting Protocol:</span>{" "}
              Rolr serves as the contracting party on both sides (Client Services Agreement with Employer and Contractor Agreement with Talent). Upon submission, this offer is reviewed by Rolr Admin before being released to the candidate.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Role Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Role Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Account Manager, Junior Website Manager"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all ${
                  errors.role
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950"
                }`}
              />
              {errors.role && <p className="mt-1 text-xs text-rose-500">{errors.role}</p>}
            </div>

            {/* Date and Duration row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={getTodayString()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all ${
                      errors.startDate
                        ? "border-rose-400"
                        : "border-slate-200 dark:border-slate-800 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.startDate && <p className="mt-1 text-xs text-rose-500">{errors.startDate}</p>}
              </div>

              {/* End Date (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  End Date <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  min={startDate || getTodayString()}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all ${
                    errors.endDate
                      ? "border-rose-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-blue-500"
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-xs text-rose-500">{errors.endDate}</p>}
              </div>

              {/* Duration string */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Duration <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 months, Ongoing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Rates & Currency Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Currency */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 capitalize"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Rate 1: Employer Billing Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Employer Billing Rate ({currency} / {billingCycle}) <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-all ${
                    errors.employerBillingRate
                      ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950"
                      : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950"
                  }`}
                >
                  <span className="inline-flex items-center px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border-r border-slate-200 dark:border-slate-800 select-none shrink-0">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={employerBillingRate}
                    onChange={(e) => setEmployerBillingRate(e.target.value)}
                    placeholder="e.g. 6000"
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Amount billed to your company under the Client Services Agreement.
                </p>
                {errors.employerBillingRate && (
                  <p className="mt-1 text-xs text-rose-500">{errors.employerBillingRate}</p>
                )}
              </div>

              {/* Rate 2: Candidate Target Pay (Visible only during creation) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Candidate Pay ({currency} / {billingCycle}) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Rolr Bilateral Rate Setup
                  </span>
                </div>
                <div
                  className={`flex rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-all ${
                    errors.jobSeekerPayoutRate
                      ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950"
                      : "border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950"
                  }`}
                >
                  <span className="inline-flex items-center px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border-r border-slate-200 dark:border-slate-800 select-none shrink-0">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={jobSeekerPayoutRate}
                    onChange={(e) => setJobSeekerPayoutRate(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Used by Rolr Admin to construct the candidate Contractor Agreement. This rate is strictly hidden from your ongoing employer views once the offer is created.
                </p>
                {errors.jobSeekerPayoutRate && (
                  <p className="mt-1 text-xs text-rose-500">{errors.jobSeekerPayoutRate}</p>
                )}
              </div>
            </div>

            {/* Custom Terms & Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Terms / Scope / Notes <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Outline any special working hours, equipment requirements, deliverables, or engagement conditions..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Offer...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Offer for Rolr Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

