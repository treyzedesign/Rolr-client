import React from "react";
import type {
  ApplicationStatus,
  OfferStatus,
  ContractStatus,
  EngagementStatus,
} from "@/types/hiring";

interface BadgeProps {
  status?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ApplicationStatusBadge({ status, className = "", size = "sm" }: BadgeProps) {
  if (!status) return null;
  const s = status.toLowerCase() as ApplicationStatus;

  const styles: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    submitted: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
    matched: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
    shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50",
    selected: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800/50",
    offer_pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
    offer_accepted: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    contract_pending: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50",
    hired: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
    offer_declined: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
    contract_expired: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
    on_hold: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    submitted: "Submitted",
    matched: "Matched",
    shortlisted: "Shortlisted",
    selected: "Selected",
    offer_pending: "Offer Pending Review",
    offer_accepted: "Offer Accepted",
    contract_pending: "Contracts Out for Signature",
    hired: "Hired 🎉",
    offer_declined: "Offer Declined",
    contract_expired: "Contract Expired",
    on_hold: "On Hold",
    rejected: "Rejected",
  };

  const currentStyle = styles[s] || "bg-slate-50 text-slate-600 border-slate-200";
  const currentLabel = labels[s] || status;

  const sizeClass =
    size === "lg"
      ? "text-xs px-3 py-1 font-semibold"
      : size === "md"
      ? "text-[11px] px-2.5 py-0.5 font-semibold"
      : "text-[10px] px-2 py-0.5 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full ${sizeClass} ${currentStyle} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {currentLabel}
    </span>
  );
}

export function OfferStatusBadge({ status, className = "", size = "sm" }: BadgeProps) {
  if (!status) return null;
  const s = status.toLowerCase() as OfferStatus;

  const styles: Record<OfferStatus, string> = {
    pending_admin_approval:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
    approved:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
    rejected:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
    accepted:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    declined:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    cancelled:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
  };

  const labels: Record<OfferStatus, string> = {
    pending_admin_approval: "Pending Rolr Approval",
    approved: "Approved by Rolr / Ready for Candidate",
    rejected: "Rejected by Admin",
    accepted: "Accepted by Candidate",
    declined: "Declined",
    cancelled: "Cancelled",
  };

  const currentStyle = styles[s] || "bg-slate-50 text-slate-600 border-slate-200";
  const currentLabel = labels[s] || status;

  const sizeClass =
    size === "lg"
      ? "text-xs px-3 py-1 font-semibold"
      : size === "md"
      ? "text-[11px] px-2.5 py-0.5 font-semibold"
      : "text-[10px] px-2 py-0.5 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full ${sizeClass} ${currentStyle} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {currentLabel}
    </span>
  );
}

export function ContractStatusBadge({ status, className = "", size = "sm" }: BadgeProps) {
  if (!status) return null;
  const s = status.toLowerCase() as ContractStatus;

  const styles: Record<ContractStatus, string> = {
    draft: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    sent: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
    signed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    declined: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
    expired: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
    voided: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const labels: Record<ContractStatus, string> = {
    draft: "Draft",
    sent: "Awaiting Signature",
    signed: "Signed ✅",
    declined: "Declined",
    expired: "Expired",
    voided: "Voided",
  };

  const currentStyle = styles[s] || "bg-slate-50 text-slate-600 border-slate-200";
  const currentLabel = labels[s] || status;

  const sizeClass =
    size === "lg"
      ? "text-xs px-3 py-1 font-semibold"
      : size === "md"
      ? "text-[11px] px-2.5 py-0.5 font-semibold"
      : "text-[10px] px-2 py-0.5 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full ${sizeClass} ${currentStyle} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {currentLabel}
    </span>
  );
}

export function EngagementStatusBadge({ status, className = "", size = "sm" }: BadgeProps) {
  if (!status) return null;
  const s = status.toLowerCase() as EngagementStatus;

  const styles: Record<EngagementStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    paused: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
    terminated: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
    completed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
  };

  const labels: Record<EngagementStatus, string> = {
    active: "Active Placement",
    paused: "Paused",
    terminated: "Terminated",
    completed: "Completed",
  };

  const currentStyle = styles[s] || "bg-slate-50 text-slate-600 border-slate-200";
  const currentLabel = labels[s] || status;

  const sizeClass =
    size === "lg"
      ? "text-xs px-3 py-1 font-semibold"
      : size === "md"
      ? "text-[11px] px-2.5 py-0.5 font-semibold"
      : "text-[10px] px-2 py-0.5 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full ${sizeClass} ${currentStyle} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {currentLabel}
    </span>
  );
}

