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
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useHiringStore } from "@/stores/hiring-store";
import { OfferDetailDrawer } from "@/components/admin/OfferDetailDrawer";
import { OfferStatusBadge } from "@/components/hiring/StatusBadges";
import type { Offer, OfferStatus } from "@/types/hiring";

export default function AdminOffersPage() {
  const { offers, fetchOffers, isLoading } = useHiringStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const employer = typeof offer.employerId === "object" ? offer.employerId : null;
      const candidate = typeof offer.jobSeekerId === "object" ? offer.jobSeekerId : null;

      const empName = (employer?.profile?.business_name || employer?.profile?.company || employer?.fullName || employer?.email || "").toLowerCase();
      const candName = (`${candidate?.profile?.first_name || ""} ${candidate?.profile?.last_name || ""}` || candidate?.fullName || candidate?.email || "").toLowerCase();
      const role = (offer.role || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = empName.includes(q) || candName.includes(q) || role.includes(q);
      const matchesStatus = statusFilter === "all" ? true : offer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, search, statusFilter]);

  const pendingCount = offers.filter((o) => o.status === "pending_admin_approval").length;
  const approvedCount = offers.filter((o) => o.status === "approved").length;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRowClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Hire Offers & Approvals</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              Bilateral Oversight
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review employer hire offers, verify bilateral margin spreads, approve contracts, and monitor candidate acceptance.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Pending Rolr Approval
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{pendingCount}</h3>
          <span className="text-[10px] text-slate-400">Requires admin action</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Approved & Released
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{approvedCount}</h3>
          <span className="text-[10px] text-slate-400">Awaiting candidate decision</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Accepted by Candidate
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{acceptedCount}</h3>
          <span className="text-[10px] text-slate-400">Contracts dispatched</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Total Pipeline Offers
          </span>
          <h3 className="text-2xl font-black text-white mt-1">{offers.length}</h3>
          <span className="text-[10px] text-slate-400">All-time offers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          {[
            { id: "all", label: "All Offers" },
            { id: "pending_admin_approval", label: "Pending Approval" },
            { id: "approved", label: "Approved" },
            { id: "accepted", label: "Accepted" },
            { id: "rejected", label: "Rejected" },
            { id: "declined", label: "Declined" },
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
          <p className="text-xs text-slate-400">Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Offers Match</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Employer</th>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Start Date</th>
                  <th className="py-3.5 px-5">Employer / Talent Rates</th>
                  <th className="py-3.5 px-5">Rolr Margin</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredOffers.map((offer, index) => {
                  const employer = typeof offer.employerId === "object" ? offer.employerId : null;
                  const candidate = typeof offer.jobSeekerId === "object" ? offer.jobSeekerId : null;

                  const empName = employer?.profile?.business_name || employer?.fullName || "Employer";
                  const candName = candidate?.profile?.first_name && candidate?.profile?.last_name
                    ? `${candidate.profile.first_name} ${candidate.profile.last_name}`
                    : candidate?.fullName || "Candidate";

                  const billing = offer.employerBillingRate ?? 0;
                  const payout = offer.jobSeekerPayoutRate ?? 0;
                  const margin = billing - payout;
                  const marginPct = billing > 0 ? ((margin / billing) * 100).toFixed(0) : "0";

                  return (
                    <tr
                      key={offer._id || (offer as any).id || `offer-${index}`}
                      onClick={() => handleRowClick(offer)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Employer */}
                      <td className="py-3.5 px-5 font-bold text-white">
                        <span className="block truncate max-w-[140px]">{empName}</span>
                        <span className="text-[10px] text-slate-500 font-normal truncate block max-w-[140px]">
                          {employer?.email}
                        </span>
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-5 font-bold text-white">
                        <span className="block truncate max-w-[140px]">{candName}</span>
                        <span className="text-[10px] text-slate-500 font-normal truncate block max-w-[140px]">
                          {candidate?.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5 font-semibold text-slate-200">
                        {offer.role}
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-5 text-slate-400">
                        {formatDate(offer.startDate)}
                      </td>

                      {/* Side-by-side rates (Admin Only) */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-white">
                          ${billing.toLocaleString()} <span className="text-slate-500 font-normal">bill</span>
                        </div>
                        <div className="text-[10px] text-blue-400 font-semibold">
                          ${payout.toLocaleString()} <span className="text-slate-500 font-normal">pay</span>
                        </div>
                      </td>

                      {/* Rolr Margin */}
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
                        <OfferStatusBadge status={offer.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(offer)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-bold text-[11px] transition-all flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Audit Drawer */}
      <OfferDetailDrawer
        offer={selectedOffer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOffer(null);
        }}
        onUpdated={() => {
          fetchOffers();
        }}
      />
    </div>
  );
}

