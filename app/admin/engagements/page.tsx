"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Building2,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  Download,
  Ban,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { EngagementStatusBadge, ContractStatusBadge } from "@/components/hiring/StatusBadges";
import type { Engagement, EngagementStatus } from "@/types/hiring";

export default function AdminEngagementsPage() {
  const { engagements, fetchEngagements, adminTerminateEngagement, isLoading } = useHiringStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [terminateEngagement, setTerminateEngagement] = useState<Engagement | null>(null);
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationError, setTerminationError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  const filteredEngagements = useMemo(() => {
    return engagements.filter((eng) => {
      const emp = eng.employerId;
      const cand = eng.jobSeekerId;

      const empName = (emp?.profile?.business_name || emp?.profile?.company || emp?.fullName || emp?.email || "").toLowerCase();
      const candName = (`${cand?.profile?.first_name || ""} ${cand?.profile?.last_name || ""}` || cand?.fullName || cand?.email || "").toLowerCase();
      const role = (eng.role || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = empName.includes(q) || candName.includes(q) || role.includes(q);
      const matchesStatus = statusFilter === "all" ? true : eng.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [engagements, search, statusFilter]);

  const activeCount = engagements.filter((e) => e.status === "active").length;
  const completedCount = engagements.filter((e) => e.status === "completed").length;
  const terminatedCount = engagements.filter((e) => e.status === "terminated").length;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Indefinite";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleConfirmTerminate = async () => {
    if (!terminateEngagement) return;
    if (terminationReason.trim().length < 3) {
      setTerminationError("Termination reason must be at least 3 characters");
      return;
    }

    try {
      setActionLoading(true);
      await adminTerminateEngagement(terminateEngagement._id, terminationReason.trim());
      setTerminateEngagement(null);
      setTerminationReason("");
      fetchEngagements();
    } catch (err) {
      // toast in store
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Active Engagements & Placements</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
              Bilateral Placements
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit platform-wide live placements, monitor bilateral bill and payout spreads, and handle administrative terminations.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Active Placements
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{activeCount}</h3>
          <span className="text-[10px] text-slate-400">Currently generating billing</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Completed Placements
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{completedCount}</h3>
          <span className="text-[10px] text-slate-400">Successfully concluded</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Terminated
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{terminatedCount}</h3>
          <span className="text-[10px] text-slate-400">Terminated early</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Total Engagements
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{engagements.length}</h3>
          <span className="text-[10px] text-slate-400">All-time hires</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          {[
            { id: "all", label: "All Engagements" },
            { id: "active", label: "Active" },
            { id: "paused", label: "Paused" },
            { id: "completed", label: "Completed" },
            { id: "terminated", label: "Terminated" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employer, candidate, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading engagements...</p>
        </div>
      ) : filteredEngagements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Engagements Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Employer</th>
                  <th className="py-3.5 px-5">Talent</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Timeline</th>
                  <th className="py-3.5 px-5">Billing vs Payout (Spread)</th>
                  <th className="py-3.5 px-5">Rolr Margin</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEngagements.map((eng, index) => {
                  const emp = eng.employerId;
                  const cand = eng.jobSeekerId;

                  const empName = emp?.profile?.business_name || emp?.fullName || "Employer";
                  const candName = cand?.profile?.first_name && cand?.profile?.last_name
                    ? `${cand.profile.first_name} ${cand.profile.last_name}`
                    : cand?.fullName || "Talent";

                  const billing = eng.rates?.employerBillingRate ?? 0;
                  const payout = eng.rates?.jobSeekerPayoutRate ?? 0;
                  const margin = billing - payout;
                  const marginPct = billing > 0 ? ((margin / billing) * 100).toFixed(0) : "0";

                  return (
                    <tr
                      key={eng._id || (eng as any).id || `eng-${index}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Employer */}
                      <td className="py-3.5 px-5 font-bold text-white">
                        <span className="block truncate max-w-[140px]">{empName}</span>
                        <span className="text-[10px] text-slate-500 font-normal truncate block max-w-[140px]">
                          {emp?.email}
                        </span>
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-5 font-bold text-white">
                        <span className="block truncate max-w-[140px]">{candName}</span>
                        <span className="text-[10px] text-slate-500 font-normal truncate block max-w-[140px]">
                          {cand?.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5 font-semibold text-slate-200">
                        {eng.role || "Talent Specialist"}
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-5 text-slate-400">
                        <div>{formatDate(eng.startDate)}</div>
                        <div className="text-[10px] text-slate-500">to {formatDate(eng.endDate)}</div>
                      </td>

                      {/* Rates */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-white">
                          ${billing.toLocaleString()} <span className="text-slate-500 font-normal">bill</span>
                        </div>
                        <div className="text-[10px] text-blue-400 font-semibold">
                          ${payout.toLocaleString()} <span className="text-slate-500 font-normal">pay</span>
                        </div>
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-cyan-400">
                          ${margin.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-400 ml-1.5 font-semibold">
                          ({marginPct}%)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <EngagementStatusBadge status={eng.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        {eng.status === "active" ? (
                          <button
                            onClick={() => {
                              setTerminateEngagement(eng);
                              setTerminationReason("");
                              setTerminationError("");
                            }}
                            className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-[11px] transition-colors ml-auto flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Terminate</span>
                          </button>
                        ) : eng.terminationReason ? (
                          <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate block ml-auto" title={eng.terminationReason}>
                            Reason: {eng.terminationReason}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Destructive Terminate Modal */}
      <AnimatePresence>
        {terminateEngagement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setTerminateEngagement(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/60 p-6 shadow-2xl z-10 text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-base">Terminate Bilateral Engagement</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are about to terminate the active placement for{" "}
                <span className="font-bold text-white">
                  {terminateEngagement.jobSeekerId?.profile?.first_name} {terminateEngagement.jobSeekerId?.profile?.last_name}
                </span>{" "}
                with{" "}
                <span className="font-bold text-white">
                  {terminateEngagement.employerId?.profile?.business_name || "Employer"}
                </span>
                . This stops billing and sets the engagement to terminated.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Required Termination Reason (min 3 chars) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={terminationReason}
                  onChange={(e) => {
                    setTerminationReason(e.target.value);
                    if (terminationError) setTerminationError("");
                  }}
                  placeholder="e.g. Project canceled by client, mutual agreement, performance breach..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-rose-500"
                />
                {terminationError && (
                  <p className="mt-1 text-xs text-rose-400">{terminationError}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTerminateEngagement(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-full border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTerminate}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Terminate Placement</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

