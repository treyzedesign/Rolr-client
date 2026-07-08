"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { interviewsApi } from "@/lib/api/interviews";
import type { CandidateInterviewSession } from "@/lib/api/interviews";
import { Video, Clock, CheckCircle, AlertCircle, Loader2, Briefcase, Calendar, Bell } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";

export default function InterviewSessionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  const [sessions, setSessions] = useState<CandidateInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchProfile();
    const fetchSessions = async () => {
      try {
        const response = await interviewsApi.getCandidateSessions();
        console.log("Sessions API response:", response);
        setSessions(response.sessions || []);
      } catch (err) {
        console.error("Failed to fetch interview sessions:", err);
        setError("Failed to load your interview sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [fetchProfile]);

  const handleStartInterview = (sessionId: string) => {
    router.push(`/candidate/interviews/session?session=${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  // 1. Loading State (Premium Spinner matches Mockup)
  if (loading) {
    return (
      <div className="space-y-6 pb-12 flex flex-col min-h-full">
        {/* Page Header */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Interviews
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage and complete your interview sessions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {candidateProfile?.profile_image_url ? (
                  <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  candidateName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner Workspace */}
        <div className="flex-1 flex flex-col justify-center items-center pt-32 text-center select-none">
          <div className="relative flex items-center justify-center w-12 h-12 mb-6">
            <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Fetching Your Interviews....
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            We're checking for your upcoming and past interview. Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Interviews
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage and complete your interview sessions
          </p>
        </div>
        
        {/* Top-Right Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-655 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
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
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state info banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 max-w-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-750 font-bold">{error}</p>
        </div>
      )}

      {/* Main content view */}
      {sessions.length === 0 ? (
        /* 2. Empty Board state */
        <div className="flex-1 flex flex-col justify-center items-center pt-28 pb-16 text-center select-none max-w-sm mx-auto">
          {/* Clipboard overlaps illustration */}
          <div className="relative w-28 h-28 mb-6">
            {/* Background card */}
            <div className="absolute top-2 left-2 w-20 h-24 bg-white border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-2xl shadow-xs rotate-[-6deg] flex items-center justify-center">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1.5 w-8 h-3 bg-blue-500 rounded-sm"></div>
            </div>
            {/* Foreground card */}
            <div className="absolute top-4 left-6 w-20 h-24 bg-white border border-slate-150 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] rotate-[3deg] flex flex-col items-center justify-center p-3">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1.5 w-8 h-3 bg-blue-500 rounded-sm shadow-xs"></div>
              <div className="w-10 h-1 bg-slate-100 dark:bg-slate-850 rounded-full mb-1"></div>
              <div className="w-8 h-1 bg-slate-100 dark:bg-slate-850 rounded-full mb-2"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Interview Yet</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            You don't have any interview session yet. Complete your profile and start applying to jobs to receive interview invitations.
          </p>
          
          <button
            onClick={() => router.push('/candidate/discover')}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all border-none cursor-pointer shadow-sm hover:scale-102 active:scale-95"
          >
            Go to Jobs
          </button>
        </div>
      ) : (
        /* 3. High-fidelity interviews grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start mt-4">
          {sessions.map((session) => {
            const companyName = (session as any).job_id?.employer_id?.profile?.business_name || (session as any).job_id?.employer_name || "Rolr.ca";
            const skillsList = session.job_id?.required_skills && session.job_id.required_skills.length > 0
              ? session.job_id.required_skills.slice(0, 4)
              : ["Communication", "Management", "Team Work", "Proactive"];

            return (
              <div
                key={session._id}
                className="bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-transparent rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start min-h-[260px]"
              >
                {/* Job Title & Company */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    {session.job_id?.title || "Virtual Assistant"}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                    {companyName}
                  </p>
                </div>

                {/* Calendar & Time meta row */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 mt-4 mb-2 select-none">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                    <span>{formatTime(session.created_at)}</span>
                  </div>
                </div>

                {/* Expiry Time Row */}
                {(session.status === "pending" || session.status === "in_progress") && (
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 select-none mb-3">
                    <Clock className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                    <span>Expires: {formatTimeRemaining(session.expires_at)}</span>
                  </div>
                )}

                {/* Skills badges */}
                <div className="mb-6 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 select-none">
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold rounded-full dark:bg-blue-955/20 dark:text-blue-400 select-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {session.status === "completed" ? (
                    <div className="w-full py-2.5 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 select-none border border-transparent dark:bg-green-955/15 dark:text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </div>
                  ) : session.status === "expired" ? (
                    <div className="w-full py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 select-none border border-transparent dark:bg-red-955/15 dark:text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Expired
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartInterview(session._id)}
                      className="w-full py-2.5 border border-blue-600 hover:bg-blue-50/50 text-blue-600 text-xs font-bold rounded-full transition-all border-solid bg-transparent cursor-pointer active:scale-95 flex items-center justify-center dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-955/15"
                    >
                      Take the Interview
                    </button>
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
