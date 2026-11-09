"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  Bell, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { useHiringStore } from "@/stores/hiring-store";
import { OfferCard } from "@/components/candidate/OfferCard";
import type { OfferStatus } from "@/types/hiring";

type OfferFilter = "all" | "action_required" | "accepted" | "declined";

export default function CandidateOffersPage() {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OfferFilter>("all");

  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const { offers, fetchOffers, isLoading } = useHiringStore();
  const candidateProfile = getCandidateProfile();

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    fetchOffers();
  }, [fetchProfile, fetchOffers]);

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  // Filtered list
  const filteredOffers = offers.filter((offer) => {
    if (activeFilter === "action_required") {
      return offer.status === "approved";
    }
    if (activeFilter === "accepted") {
      return offer.status === "accepted";
    }
    if (activeFilter === "declined") {
      return offer.status === "declined";
    }
    return true;
  });

  const actionRequiredCount = offers.filter((o) => o.status === "approved").length;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;
  const declinedCount = offers.filter((o) => o.status === "declined").length;

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Job Offers
            </h1>
            {actionRequiredCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                {actionRequiredCount} Action Required
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review, accept, or decline official bilateral job offers from employers
          </p>
        </div>

        {/* Top-Right Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Bell */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
            <Bell className="h-5 w-5" />
            {actionRequiredCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* User badge */}
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
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Notice about Bilateral Contracting Protection */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/70 dark:border-blue-900/40 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            Rolr Bilateral Contracting & Rate Protection
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            All offers are contracted directly with Rolr Inc. Once you accept, an official Contractor Agreement is automatically generated and sent to your email for e-signature. Your contractor payout rate is strictly protected and guaranteed upon milestone completion.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 select-none">
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-150 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            All Offers ({offers.length})
          </button>
          <button
            onClick={() => setActiveFilter("action_required")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "action_required"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {actionRequiredCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            Action Required ({actionRequiredCount})
          </button>
          <button
            onClick={() => setActiveFilter("accepted")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "accepted"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveFilter("declined")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "declined"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Declined ({declinedCount})
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-start">
        {/* 1. Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col justify-center items-center pt-24 text-center">
            <div className="relative flex items-center justify-center w-12 h-12 mb-6 select-none">
              <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Loading Your Job Offers
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Gathering your latest offers and bilateral contract statuses...
            </p>
          </div>
        )}

        {/* 2. Empty State */}
        {!isLoading && filteredOffers.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center pt-24 max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-sm">
              <Award className="w-10 h-10" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeFilter === "action_required"
                ? "No Offers Requiring Action"
                : activeFilter === "accepted"
                ? "No Accepted Offers Yet"
                : activeFilter === "declined"
                ? "No Declined Offers"
                : "No Job Offers Yet"}
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeFilter === "all"
                ? "When employers select you after interviews, their official hire offers will appear here for your review and acceptance."
                : "Try switching filters to view all your offers or check back once an employer issues a decision."}
            </p>

            <Link
              href="/candidate/discover"
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all text-center select-none cursor-pointer"
            >
              Explore Jobs
            </Link>
          </div>
        )}

        {/* 3. Offer Cards List */}
        {!isLoading && filteredOffers.length > 0 && (
          <div className="space-y-6">
            {filteredOffers.map((offer, index) => (
              <OfferCard
                key={offer._id || (offer as any).id || `offer-${index}`}
                offer={offer}
                onRefresh={fetchOffers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

