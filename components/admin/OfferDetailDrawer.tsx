"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
  Percent,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Send,
  Mail,
  RefreshCw,
  FileCheck,
  Info,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { OfferStatusBadge, ContractStatusBadge } from "@/components/hiring/StatusBadges";
import type { Offer, ContractReference } from "@/types/hiring";
import toast from "react-hot-toast";

interface OfferDetailDrawerProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function OfferDetailDrawer({
  offer,
  isOpen,
  onClose,
  onUpdated,
}: OfferDetailDrawerProps) {
  const {
    adminApproveOffer,
    adminRejectOffer,
    resendOfferContracts,
    resendContract,
    isLoading,
  } = useHiringStore();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [showResendModal, setShowResendModal] = useState(false);
  const [contractTypeToResend, setContractTypeToResend] = useState<
    "both" | "client_agreement" | "contractor_agreement"
  >("both");

  const [actionLoading, setActionLoading] = useState(false);
  const [resendingBulk, setResendingBulk] = useState(false);
  const [resendingContractId, setResendingContractId] = useState<string | null>(null);

  if (!offer || !isOpen) return null;

  const employer = typeof offer.employerId === "object" ? offer.employerId : null;
  const candidate = typeof offer.jobSeekerId === "object" ? offer.jobSeekerId : null;

  const employerName =
    employer?.profile?.business_name ||
    employer?.profile?.company ||
    employer?.fullName ||
    "Employer";
  const candidateName =
    candidate?.profile?.first_name && candidate?.profile?.last_name
      ? `${candidate.profile.first_name} ${candidate.profile.last_name}`
      : candidate?.fullName || "Candidate";

  const billingRate = offer.employerBillingRate ?? 0;
  const payoutRate = offer.jobSeekerPayoutRate ?? 0;
  const marginAmount = billingRate - payoutRate;
  const marginPercent =
    billingRate > 0 ? ((marginAmount / billingRate) * 100).toFixed(1) : "0.0";

  // Contract references
  const clientContract =
    typeof offer.clientContractId === "object" ? offer.clientContractId : null;
  const clientContractId =
    clientContract?._id ||
    clientContract?.id ||
    (typeof offer.clientContractId === "string" ? offer.clientContractId : "");
  const isClientSigned = clientContract?.status === "signed";

  const contractorContract =
    typeof offer.contractorContractId === "object"
      ? offer.contractorContractId
      : null;
  const contractorContractId =
    contractorContract?._id ||
    contractorContract?.id ||
    (typeof offer.contractorContractId === "string" ? offer.contractorContractId : "");
  const isContractorSigned = contractorContract?.status === "signed";

  const hasContracts = Boolean(
    offer.clientContractId || offer.contractorContractId || offer.status === "accepted"
  );
  const canResendContracts = hasContracts && (!isClientSigned || !isContractorSigned);

  // Auto-select valid contract type for modal
  const openResendModal = () => {
    if (isClientSigned && !isContractorSigned) {
      setContractTypeToResend("contractor_agreement");
    } else if (isContractorSigned && !isClientSigned) {
      setContractTypeToResend("client_agreement");
    } else {
      setContractTypeToResend("both");
    }
    setShowResendModal(true);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Indefinite";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRate = (rate?: number) => {
    if (rate === undefined || rate === null) return "--";
    const symbol =
      offer.currency === "USD"
        ? "$"
        : offer.currency === "NGN"
        ? "₦"
        : offer.currency === "GBP"
        ? "£"
        : offer.currency === "EUR"
        ? "€"
        : `${offer.currency} `;
    return `${symbol}${rate.toLocaleString()} / ${offer.billingCycle}`;
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await adminApproveOffer(offer._id);
      onUpdated?.();
      onClose();
    } catch (err) {
      // Toast handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectReason.trim().length < 3) {
      setRejectError("Rejection reason must be at least 3 characters");
      return;
    }
    try {
      setActionLoading(true);
      await adminRejectOffer(offer._id, rejectReason.trim());
      setShowRejectModal(false);
      onUpdated?.();
      onClose();
    } catch (err) {
      // Toast handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkResend = async () => {
    try {
      setResendingBulk(true);
      await resendOfferContracts(offer._id, { contractType: contractTypeToResend });
      setShowResendModal(false);
      onUpdated?.();
    } catch (err) {
      // Toast handled in store
    } finally {
      setResendingBulk(false);
    }
  };

  const handleIndividualResend = async (
    contractId: string,
    type: "client_agreement" | "contractor_agreement"
  ) => {
    try {
      setResendingContractId(contractId || type);
      if (contractId) {
        await resendContract(contractId, offer._id);
      } else {
        await resendOfferContracts(offer._id, { contractType: type });
      }
      onUpdated?.();
    } catch (err) {
      // Toast handled in store
    } finally {
      setResendingContractId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Bilateral Offer Audit
                  </span>
                  <OfferStatusBadge status={offer.status} />
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{offer.role}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Offer ID: {offer._id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Bilateral Parties Card */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                {/* Employer Party */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    Employer Client
                  </span>
                  <p className="font-bold text-sm text-white">{employerName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{employer?.email}</p>
                  <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Client Services Party
                  </span>
                </div>

                {/* Candidate Party */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-400" />
                    Candidate Contractor
                  </span>
                  <p className="font-bold text-sm text-white">{candidateName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{candidate?.email}</p>
                  <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Contractor Party
                  </span>
                </div>
              </div>

              {/* Bilateral Rate Comparison & Rolr Margin */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 border border-cyan-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    Admin Rate Audit & Rolr Margin
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                    Admin Eyes Only
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {/* Employer Rate */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Employer Bill Rate
                    </span>
                    <span className="text-base font-extrabold text-white mt-1 block">
                      {formatRate(offer.employerBillingRate)}
                    </span>
                    <span className="text-[9px] text-slate-500">Billed to client</span>
                  </div>

                  {/* Candidate Payout */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Talent Payout Rate
                    </span>
                    <span className="text-base font-extrabold text-blue-400 mt-1 block">
                      {formatRate(offer.jobSeekerPayoutRate)}
                    </span>
                    <span className="text-[9px] text-slate-500">Paid to contractor</span>
                  </div>

                  {/* Rolr Margin */}
                  <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800/60">
                    <span className="text-[10px] text-cyan-300 block font-semibold">
                      Rolr Gross Margin
                    </span>
                    <span className="text-base font-black text-cyan-300 mt-1 block">
                      {formatRate(marginAmount)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {marginPercent}% margin
                    </span>
                  </div>
                </div>
              </div>

              {/* Bilateral Contracts Status & Resend Management */}
              {hasContracts && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Live Bilateral Legal Agreements
                    </h4>
                    {canResendContracts && (
                      <button
                        type="button"
                        onClick={openResendModal}
                        disabled={resendingBulk || actionLoading}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Options</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {/* Agreement 1: Client Agreement (Rolr ↔ Employer) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">
                              Client Services Agreement
                            </span>
                            <ContractStatusBadge
                              status={clientContract?.status || (offer.status === "accepted" ? "sent" : "draft")}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Parties: <span className="text-slate-300 font-semibold">Rolr Inc. ↔ {employerName}</span>
                          </p>
                        </div>

                        {/* Individual Resend Button */}
                        <button
                          type="button"
                          onClick={() => handleIndividualResend(clientContractId, "client_agreement")}
                          disabled={isClientSigned || resendingContractId === (clientContractId || "client_agreement") || actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isClientSigned
                              ? "bg-slate-900 text-emerald-400 border border-emerald-900/40 cursor-not-allowed opacity-80"
                              : "bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 active:scale-95"
                          }`}
                          title={isClientSigned ? "Contract already signed by Employer" : "Resend fresh signing link to Employer"}
                        >
                          {resendingContractId === (clientContractId || "client_agreement") ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{isClientSigned ? "Signed" : "Resend"}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="space-y-0.5">
                          {clientContract?.externalId && (
                            <div>
                              Ref: <span className="text-slate-300 font-mono">{clientContract.externalId}</span>
                            </div>
                          )}
                          {clientContract?.documensoDocumentId && (
                            <div>
                              Documenso ID:{" "}
                              <span className="text-slate-300 font-mono">
                                {clientContract.documensoDocumentId}
                              </span>
                            </div>
                          )}
                          {clientContract?.signedAt && (
                            <div className="text-emerald-400 font-medium">
                              Signed on: {new Date(clientContract.signedAt).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {clientContract?.documentUrl && (
                          <a
                            href={clientContract.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold ml-auto"
                          >
                            <span>Open in Documenso</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Agreement 2: Contractor Agreement (Rolr ↔ Job Seeker) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">
                              Contractor Agreement
                            </span>
                            <ContractStatusBadge
                              status={contractorContract?.status || (offer.status === "accepted" ? "sent" : "draft")}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Parties: <span className="text-slate-300 font-semibold">Rolr Inc. ↔ {candidateName}</span>
                          </p>
                        </div>

                        {/* Individual Resend Button */}
                        <button
                          type="button"
                          onClick={() => handleIndividualResend(contractorContractId, "contractor_agreement")}
                          disabled={isContractorSigned || resendingContractId === (contractorContractId || "contractor_agreement") || actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isContractorSigned
                              ? "bg-slate-900 text-emerald-400 border border-emerald-900/40 cursor-not-allowed opacity-80"
                              : "bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-slate-950 border border-blue-500/30 active:scale-95"
                          }`}
                          title={isContractorSigned ? "Contract already signed by Candidate" : "Resend fresh signing link to Candidate"}
                        >
                          {resendingContractId === (contractorContractId || "contractor_agreement") ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{isContractorSigned ? "Signed" : "Resend"}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="space-y-0.5">
                          {contractorContract?.externalId && (
                            <div>
                              Ref: <span className="text-slate-300 font-mono">{contractorContract.externalId}</span>
                            </div>
                          )}
                          {contractorContract?.documensoDocumentId && (
                            <div>
                              Documenso ID:{" "}
                              <span className="text-slate-300 font-mono">
                                {contractorContract.documensoDocumentId}
                              </span>
                            </div>
                          )}
                          {contractorContract?.signedAt && (
                            <div className="text-emerald-400 font-medium">
                              Signed on: {new Date(contractorContract.signedAt).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {contractorContract?.documentUrl && (
                          <a
                            href={contractorContract.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 font-semibold ml-auto"
                          >
                            <span>Open in Documenso</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Offer Terms & Timeline */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="font-bold text-white">{formatDate(offer.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">End Date:</span>
                  <span className="font-bold text-white">{formatDate(offer.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-white">{offer.duration || "Standard"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Cycle:</span>
                  <span className="font-bold text-white capitalize">{offer.billingCycle}</span>
                </div>
                {offer.terms && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Custom Notes / Scope:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg whitespace-pre-wrap">
                      {offer.terms}
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection / Decline Details */}
              {offer.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-rose-300">
                  <span className="font-bold block mb-0.5">Admin Rejection Reason:</span>
                  <p>{offer.rejectionReason}</p>
                </div>
              )}
              {offer.declineReason && (
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  <span className="font-bold block mb-0.5">Candidate Decline Reason:</span>
                  <p>{offer.declineReason}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {offer.status === "pending_admin_approval" && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reject Offer
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Approve & Release to Candidate</span>
                </button>
              </div>
            )}

            {/* When offer is accepted, display Resend Contracts button in footer */}
            {offer.status === "accepted" && canResendContracts && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Contracts Dispatched</span>
                </div>
                <button
                  type="button"
                  onClick={openResendModal}
                  disabled={resendingBulk || actionLoading}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {resendingBulk ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Contracts</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Resend Contracts Confirmation Modal */}
      <AnimatePresence>
        {showResendModal && (
          <div key="resend-contracts-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowResendModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Resend Bilateral Legal Contracts</h3>
                  <p className="text-[11px] text-slate-400">Documenso Electronic Signature Dispatch</p>
                </div>
              </div>

              {/* Informative Alert */}
              <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Resending will generate fresh signing links via Documenso and email them directly to the selected parties. Any previously issued unsigned links will be automatically invalidated.
                </p>
              </div>

              {/* Agreement Options */}
              <div className="mt-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  Select Contract Scope to Resend
                </label>

                {/* Option 1: Both */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isClientSigned || isContractorSigned
                      ? "opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800"
                      : contractTypeToResend === "both"
                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-sm"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="contractType"
                    value="both"
                    disabled={isClientSigned || isContractorSigned}
                    checked={contractTypeToResend === "both"}
                    onChange={() => setContractTypeToResend("both")}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Both Agreements (Recommended)</span>
                      {(isClientSigned || isContractorSigned) && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Unavailable (1 already signed)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Resends both the Client Services Agreement (Employer) and Contractor Agreement (Candidate).
                    </p>
                  </div>
                </label>

                {/* Option 2: Client Agreement Only */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isClientSigned
                      ? "opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800"
                      : contractTypeToResend === "client_agreement"
                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-sm"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="contractType"
                    value="client_agreement"
                    disabled={isClientSigned}
                    checked={contractTypeToResend === "client_agreement"}
                    onChange={() => setContractTypeToResend("client_agreement")}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Client Services Agreement Only</span>
                      {isClientSigned ? (
                        <span className="text-[10px] text-emerald-400 font-bold">Already Signed</span>
                      ) : (
                        <span className="text-[10px] text-cyan-400 font-semibold">Employer</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Dispatches email exclusively to <span className="text-slate-200">{employerName}</span> ({employer?.email}).
                    </p>
                  </div>
                </label>

                {/* Option 3: Contractor Agreement Only */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isContractorSigned
                      ? "opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800"
                      : contractTypeToResend === "contractor_agreement"
                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-sm"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="contractType"
                    value="contractor_agreement"
                    disabled={isContractorSigned}
                    checked={contractTypeToResend === "contractor_agreement"}
                    onChange={() => setContractTypeToResend("contractor_agreement")}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Contractor Agreement Only</span>
                      {isContractorSigned ? (
                        <span className="text-[10px] text-emerald-400 font-bold">Already Signed</span>
                      ) : (
                        <span className="text-[10px] text-blue-400 font-semibold">Candidate</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Dispatches email exclusively to <span className="text-slate-200">{candidateName}</span> ({candidate?.email}).
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResendModal(false)}
                  disabled={resendingBulk}
                  className="px-4 py-2 rounded-full border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkResend}
                  disabled={resendingBulk}
                  className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {resendingBulk ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Selected Contracts</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div key="reject-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowRejectModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base">Reject Hire Offer</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rejecting this offer returns the candidate application to the shortlisted status. Please provide a clear explanation for the employer.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Rejection Reason (min 3 chars) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  placeholder="e.g. Rate margin falls below threshold, incomplete compliance details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-rose-500"
                />
                {rejectError && <p className="mt-1 text-xs text-rose-400">{rejectError}</p>}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-full border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
