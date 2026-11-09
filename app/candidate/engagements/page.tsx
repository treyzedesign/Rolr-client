"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell,
  Briefcase,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { EngagementStatusBadge, ContractStatusBadge } from "@/components/hiring/StatusBadges";
import type { Engagement } from "@/types/hiring";

export default function CandidateEngagementsPage() {
  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  const { engagements, fetchEngagements, isLoading } = useHiringStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchEngagements();
  }, [fetchProfile, fetchEngagements]);

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Candidate";

  const emailDisplay = user?.email || "candidate@example.com";

  const filteredEngagements = useMemo(() => {
    return engagements.filter((eng) => {
      if (statusFilter === "all") return true;
      return eng.status === statusFilter;
    });
  }, [engagements, statusFilter]);

  const activeCount = engagements.filter((e) => e.status === "active").length;
  const completedCount = engagements.filter((e) => e.status === "completed").length;

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

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              My Engagements
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rolr Protected Placement
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View your active roles, contractor pay, and signed bilateral Contractor Agreements with Rolr.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <ThemeToggle />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {candidateProfile?.profile_image_url ? (
                <img
                  src={candidateProfile.profile_image_url}
                  alt="avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                candidateName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {candidateName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Candidate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Placements</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{activeCount}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 inline-block">
              Currently active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">All Placements</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{engagements.length}</h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 inline-block">
              Total career hires on Rolr
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{completedCount}</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 inline-block">
              Past successful stints
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xs">
          {[
            { id: "all", label: "All Engagements" },
            { id: "active", label: "Active" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your placements...</p>
        </div>
      ) : filteredEngagements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Engagements Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            When you accept a job offer and your Rolr Contractor Agreement is signed, your active placements and compensation will appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/candidate/discover"
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Discover Job Openings
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEngagements.map((eng, index) => {
            const employer = eng.employerId?.profile;
            const companyName = employer?.business_name || employer?.company || "Hiring Company";
            const roleTitle = eng.role || "Talent Role";
            const contractDocUrl = eng.contractorContractId?.documentUrl;

            return (
              <div
                key={eng._id || (eng as any).id || `eng-${index}`}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        {companyName}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {roleTitle}
                      </h3>
                    </div>
                    <EngagementStatusBadge status={eng.status} />
                  </div>

                  {/* Contractor Rate (STRICT ISOLATION: Only candidate rate rendered) */}
                  <div className="my-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Your Contractor Pay
                      </span>
                      <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                        {formatRate(eng.rates?.jobSeekerPayoutRate, eng.rates?.currency, eng.billingCycle)}
                      </span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                      Paid via Rolr
                    </span>
                  </div>

                  {/* Dates & Agreement Status */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Start Date:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatDate(eng.startDate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> End Date:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatDate(eng.endDate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Contractor Agreement:
                      </span>
                      <ContractStatusBadge status={eng.contractorContractId?.status || "signed"} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  {contractDocUrl ? (
                    <a
                      href={contractDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed Contractor Agreement (PDF)</span>
                    </a>
                  ) : (
                    <div className="text-center text-[11px] text-slate-400 italic">
                      Agreement copy is being generated by e-sign service
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

