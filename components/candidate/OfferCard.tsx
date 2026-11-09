"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Building2,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { OfferStatusBadge, ContractStatusBadge } from "@/components/hiring/StatusBadges";
import type { Offer } from "@/types/hiring";
import toast from "react-hot-toast";

interface OfferCardProps {
  offer: Offer;
  onRefresh?: () => void;
}

export function OfferCard({ offer, onRefresh }: OfferCardProps) {
  const { candidateAcceptOffer, candidateDeclineOffer, isLoading } = useHiringStore();

  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const employer = typeof offer.employerId === "object" ? offer.employerId : null;
  const companyName = employer?.profile?.business_name || employer?.profile?.company || "Hiring Employer";

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Indefinite";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRate = (rate?: number, currency = "USD", cycle = "monthly") => {
    if (rate === undefined || rate === null) return "--";
    const symbol = currency === "USD" ? "$" : currency === "NGN" ? "₦" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : `${currency} `;
    return `${symbol}${rate.toLocaleString()} / ${cycle}`;
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await candidateAcceptOffer(offer._id);
      setShowAcceptConfirm(false);
      onRefresh?.();
    } catch (err) {
      // toast in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setActionLoading(true);
      await candidateDeclineOffer(offer._id, declineReason.trim() || undefined);
      setShowDeclineModal(false);
      onRefresh?.();
    } catch (err) {
      // toast in store
    } finally {
      setActionLoading(false);
    }
  };

  const isApproved = offer.status === "approved";
  const isAccepted = offer.status === "accepted";
  const isDeclined = offer.status === "declined";
  const signingUrl = offer.contractorContractId?.documentUrl;

  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 rounded-[2.2rem] border-2 border-blue-200/80 dark:border-blue-900/60 p-6 sm:p-8 shadow-[0_15px_40px_rgba(41,121,255,0.08)] relative overflow-hidden">
      {/* Decorative background badge */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Official Job Offer
              </span>
              <OfferStatusBadge status={offer.status} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {offer.role}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{companyName}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>via Rolr Bilateral Contracting</span>
            </p>
          </div>
        </div>

        {/* Payout Rate Display (STRICT ISOLATION: Only candidate rate rendered) */}
        <div className="sm:text-right bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-2xl px-5 py-3 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Your Contractor Pay
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatRate(offer.jobSeekerPayoutRate, offer.currency, offer.billingCycle)}
          </span>
        </div>
      </div>

      {/* Offer Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Start Date
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {formatDate(offer.startDate)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Duration / End Date
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {offer.duration || (offer.endDate ? formatDate(offer.endDate) : "Indefinite Placement")}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Contracting Party
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            Rolr Inc. (Protected)
          </span>
        </div>
      </div>

      {/* Scope / Terms if provided */}
      {offer.terms && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5" />
            Engagement Scope & Terms
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
            {offer.terms}
          </p>
        </div>
      )}

      {/* Accepted State / Contract Pending Banner */}
      {isAccepted && (
        <div className="mt-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Offer Accepted! Bilateral Contracts Dispatched 🎉
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                We've dispatched your Rolr Contractor Agreement. Check your email or use the e-sign link below to sign and finalize your onboarding.
              </p>
              {offer.contractorContractId && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                    Contract Status:
                  </span>
                  <ContractStatusBadge status={offer.contractorContractId.status} />
                </div>
              )}
            </div>
          </div>

          {signingUrl && (
            <a
              href={signingUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <span>Sign Contract Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Declined State Notice */}
      {isDeclined && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold">You declined this offer.</span>
            {offer.declineReason && ` Reason: "${offer.declineReason}"`}
          </div>
        </div>
      )}

      {/* Action Buttons: Visible when offer is approved and ready for candidate */}
      {isApproved && (
        <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            disabled={actionLoading}
            className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
          >
            Decline Offer
          </button>
          <button
            type="button"
            onClick={() => setShowAcceptConfirm(true)}
            disabled={actionLoading}
            className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept Offer & Proceed to Contract</span>
          </button>
        </div>
      )}

      {/* Modal: Confirm Accept */}
      <AnimatePresence>
        {showAcceptConfirm && (
          <div key="accept-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAcceptConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Accept Job Offer?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                You are accepting the <span className="font-bold text-slate-800 dark:text-slate-200">{offer.role}</span> role at{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatRate(offer.jobSeekerPayoutRate, offer.currency, offer.billingCycle)}
                </span>
                .
              </p>

              <div className="mt-4 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-[11px] text-blue-800 dark:text-blue-300 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  Accepting immediately initiates parallel generation of your bilateral Rolr Contractor Agreement. You will be sent an e-signature link right away.
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAcceptConfirm(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Contracts...</span>
                    </>
                  ) : (
                    <span>Confirm & Accept</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Decline Offer */}
      <AnimatePresence>
        {showDeclineModal && (
          <div key="decline-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowDeclineModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Decline Offer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to decline this offer for <span className="font-semibold">{offer.role}</span>?
              </p>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Reason / Feedback
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Accepted another position, compensation mismatch, availability conflict..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Decline Offer</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

