"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bell,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { EngagementStatusBadge, ContractStatusBadge } from "@/components/hiring/StatusBadges";
import type { Engagement, EngagementStatus } from "@/types/hiring";

export default function EmployerEngagementsPage() {
  const { user } = useAuthStore();
  const { fetchProfile, getEmployerProfile } = useProfileStore();
  const employerProfile = getEmployerProfile();

  const { engagements, fetchEngagements, isLoading } = useHiringStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchEngagements();
  }, [fetchProfile, fetchEngagements]);

  const filteredEngagements = useMemo(() => {
    return engagements.filter((eng) => {
      const talentName = `${eng.jobSeekerId?.profile?.first_name || ""} ${eng.jobSeekerId?.profile?.last_name || ""}`.toLowerCase();
      const role = (eng.role || "").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = talentName.includes(q) || role.includes(q) || (eng.jobSeekerId?.email || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : eng.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [engagements, search, statusFilter]);

  const activeCount = engagements.filter((e) => e.status === "active").length;
  const completedCount = engagements.filter((e) => e.status === "completed").length;
  const terminatedCount = engagements.filter((e) => e.status === "terminated").length;

  const employerName = employerProfile?.business_name || employerProfile?.company || user?.fullName || "Employer";

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
    <div className="space-y-8 pb-12">
      {/* Header section matching Employer Portal standards */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Engagements & Hires
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Client Services Agreements
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track active talent placements, employer billing rates, and signed Bilateral Client Agreements with Rolr.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {employerProfile?.profile_image_url ? (
                <img
                  src={employerProfile.profile_image_url}
                  alt="avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                employerName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {employerName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Employer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Placements</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{activeCount}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 inline-block">
              Currently working
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hires</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{engagements.length}</h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 inline-block">
              All-time placements
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Engagements</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{completedCount}</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 inline-block">
              Successfully fulfilled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Pill Tabs */}
        <div className="inline-flex p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xs">
          {[
            { id: "all", label: "All Engagements" },
            { id: "active", label: "Active" },
            { id: "completed", label: "Completed" },
            { id: "terminated", label: "Terminated" },
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

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search talent or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Engagements Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your engagements...</p>
        </div>
      ) : filteredEngagements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Engagements Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {statusFilter !== "all" || search
              ? "No engagements match your current search and filter criteria."
              : "When you hire candidates through Rolr and bilateral agreements are signed, your active placements and billing details will appear here."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/employer/interviews"
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Review Interviews
            </Link>
            <Link
              href="/employer/applicants"
              className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
            >
              Browse Applicants
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Talent</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Timeline</th>
                  <th className="py-4 px-6">Billing Rate</th>
                  <th className="py-4 px-6">Client Agreement</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEngagements.map((eng, index) => {
                  const talent = eng.jobSeekerId?.profile;
                  const talentName = `${talent?.first_name || ""} ${talent?.last_name || ""}`.trim() || "Talent Candidate";
                  const roleTitle = eng.role || "Talent Specialist";
                  const contractUrl = eng.clientContractId?.documentUrl;

                  return (
                    <tr
                      key={eng._id || (eng as any).id || `eng-${index}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedEngagement(eng)}
                    >
                      {/* Talent Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                            {talent?.profile_image_url ? (
                              <img
                                src={talent.profile_image_url}
                                alt={talentName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              talentName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {talentName}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block max-w-[150px]">
                              {eng.jobSeekerId?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {roleTitle}
                        </span>
                      </td>

                      {/* Timeline */}
                      <td className="py-4 px-6">
                        <div className="text-slate-600 dark:text-slate-300 font-medium">
                          <span>{formatDate(eng.startDate)}</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span>{formatDate(eng.endDate)}</span>
                        </div>
                      </td>

                      {/* Employer Billing Rate (STRICT ISOLATION: ONLY employer rate) */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {formatRate(eng.rates?.employerBillingRate, eng.rates?.currency, eng.billingCycle)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Billed to Employer
                        </span>
                      </td>

                      {/* Client Agreement Contract Status */}
                      <td className="py-4 px-6">
                        <ContractStatusBadge status={eng.clientContractId?.status || "signed"} />
                      </td>

                      {/* Engagement Status */}
                      <td className="py-4 px-6">
                        <EngagementStatusBadge status={eng.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {contractUrl ? (
                            <a
                              href={contractUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Agreement</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Processing doc</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engagement Detail Modal */}
      <AnimatePresence>
        {selectedEngagement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSelectedEngagement(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Engagement Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ID: {selectedEngagement._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEngagement(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Talent:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedEngagement.jobSeekerId?.profile?.first_name} {selectedEngagement.jobSeekerId?.profile?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEngagement.role || "Talent Specialist"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <EngagementStatusBadge status={selectedEngagement.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(selectedEngagement.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Date:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(selectedEngagement.endDate)}</span>
                  </div>
                </div>

                {/* Billing Rate Card */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Employer Billing Rate
                    </span>
                    <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                      {formatRate(selectedEngagement.rates?.employerBillingRate, selectedEngagement.rates?.currency, selectedEngagement.billingCycle)}
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                    Billed via Rolr
                  </span>
                </div>

                {/* Client Agreement Link */}
                {selectedEngagement.clientContractId?.documentUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedEngagement.clientContractId.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Signed Client Services Agreement (PDF)</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
