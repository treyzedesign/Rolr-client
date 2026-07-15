"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  Users, 
  Eye, 
  Bell,
  CheckSquare,
  Loader2,
  Lock,
  Video
} from "lucide-react";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewSession, EmployerSessionsResponse, EmployerBooking } from "@/lib/api/interviews";
import { InterviewResultsModal } from "@/components/employer/InterviewResultsModal";
import { ShortlistModal } from "@/components/employer/ShortlistModal";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";

interface JobGroup {
  job: {
    _id: string;
    title: string;
    description: string;
  };
  sessions: InterviewSession[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    averageScore?: number;
  };
}

export default function EmployerInterviewsPage() {
  const { user } = useAuthStore();
  const { fetchProfile, getEmployerProfile } = useProfileStore();
  const employerProfile = getEmployerProfile();

  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeSubTab, setActiveSubTab] = useState<"ai_session" | "book_meet">("ai_session");
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortlistSession, setShortlistSession] = useState<InterviewSession | null>(null);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);

  // Booked Meets specific states
  const [bookings, setBookings] = useState<EmployerBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchInterviewSessions();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeSubTab === "book_meet") {
      fetchBookings(bookingStatusFilter);
    }
  }, [activeSubTab, bookingStatusFilter]);

  const fetchBookings = async (status: string = "all") => {
    try {
      setBookingsLoading(true);
      const response = await interviewsApi.getEmployerBookings(status);
      setBookings(response.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      toast.error("Failed to load booked meetings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchInterviewSessions = async () => {
    try {
      setLoading(true);
      const response: EmployerSessionsResponse = await interviewsApi.getEmployerSessions();
      const sessions = response.sessions;
      setAllSessions(sessions);
      
      // Group sessions by job
      const grouped = sessions.reduce((acc: { [key: string]: JobGroup }, session: InterviewSession) => {
        const jobId = session.job_id._id;
        
        if (!acc[jobId]) {
          acc[jobId] = {
            job: session.job_id,
            sessions: [],
            stats: {
              total: 0,
              completed: 0,
              inProgress: 0,
              pending: 0
            }
          };
        }
        
        acc[jobId].sessions.push(session);
        acc[jobId].stats.total++;
        
        if (session.status === 'completed') {
          acc[jobId].stats.completed++;
        } else if (session.status === 'in_progress') {
          acc[jobId].stats.inProgress++;
        } else {
          acc[jobId].stats.pending++;
        }
        
        return acc;
      }, {});
      
      setJobGroups(Object.values(grouped));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch interview sessions:", err);
      setError("Failed to load interview sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistConfirm = async (slots: { start: string; end: string }[]) => {
    if (!shortlistSession) return;
    try {
      await interviewsApi.shortlistCandidate(shortlistSession._id, slots);
      toast.success("Candidate shortlisted successfully!");
      fetchInterviewSessions();
    } catch (err: any) {
      console.error("Failed to shortlist candidate:", err);
      const errMsg = err?.response?.data?.message || "Failed to shortlist candidate";
      toast.error(errMsg);
      throw err;
    }
  };

  const handleViewResults = (session: InterviewSession) => {
    if (!session.is_verified) {
      toast.error("This interview session has not been verified yet.");
      return;
    }
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleCloseShortlist = () => {
    setIsShortlistOpen(false);
    setShortlistSession(null);
  };

  const formatAppliedDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    
    const getOrdinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    
    const suffix = getOrdinalSuffix(day);
    const year = date.getFullYear();
    return `${month} ${day}${suffix}, ${year}`;
  };

  const formatScheduledTime = (slot?: { start: string; end: string }) => {
    if (!slot) return "-----------------";
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateStr = start.toLocaleDateString('en-US', dateOptions);
    const startStr = start.toLocaleTimeString('en-US', timeOptions);
    const endStr = end.toLocaleTimeString('en-US', timeOptions);
    return `${dateStr}, ${startStr} - ${endStr}`;
  };

  const activeJobsCount = jobGroups.length;
  const totalCandidatesCount = allSessions.length;
  const completedCount = allSessions.filter(s => s.status === 'completed').length;
  const inProgressCount = allSessions.filter(s => s.status === 'in_progress').length;

  const employerName = employerProfile?.business_name || employerProfile?.company || user?.fullName || "Employer";
  const emailDisplay = user?.email || "employer@example.com";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching other employer portal workspaces */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {activeSubTab === "book_meet" ? "Booked Meets" : "Interview Sessions"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {activeSubTab === "book_meet" 
              ? "Manage and join your scheduled candidate interviews."
              : "Track and manage candidate interview progress by job position"
            }
          </p>
        </div>
        
        {/* Top-Right Action Controls & Profile widgets */}
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
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Employer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Header AI Session / Book Meet Tab row */}
      <div className="flex items-center gap-3 select-none relative z-30">
        <button
          onClick={() => setActiveSubTab("ai_session")}
          className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all border border-transparent cursor-pointer ${
            activeSubTab === "ai_session"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-350 border-slate-250 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          AI Session
        </button>

        <button
          onClick={() => setActiveSubTab("book_meet")}
          className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all border border-transparent cursor-pointer ${
            activeSubTab === "book_meet"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-350 border-slate-250 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          Book Meet
        </button>

        {/* Dropdown status selector for Book Meet tab */}
        {activeSubTab === "book_meet" && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5 shadow-sm select-none hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <span className="capitalize">{bookingStatusFilter}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-20 flex flex-col overflow-hidden">
                  {["all", "pending", "booked", "expired"].map((status) => {
                    const isActive = bookingStatusFilter === status;
                    return (
                      <div
                        key={status}
                        onClick={() => {
                          setBookingStatusFilter(status);
                          setIsDropdownOpen(false);
                        }}
                        className={`font-semibold text-[11px] px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isActive 
                            ? "bg-blue-50/50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 font-bold" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        <span className="capitalize">{status}</span>
                        {isActive && <span className="text-[10px] text-blue-500 font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Overview Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {/* Card 1: Active Jobs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
              {activeJobsCount}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Active Jobs
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-medium mt-0.5">
              Live Job posting
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Candidates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
              {totalCandidatesCount}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-550 font-semibold mt-1">
              Total Candidates
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-medium mt-0.5">
              Scheduled candidates
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
              {completedCount}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Completed
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-medium mt-0.5">
              Finished interview
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: In Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
              {inProgressCount}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-550 font-semibold mt-1">
              In Progress
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-550 font-medium mt-0.5">
              Pending completion
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error alert indicator */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-semibold text-red-700 max-w-sm">
          {error}
        </div>
      )}

      {/* Bottom Main Content Panel */}
      {activeSubTab === "ai_session" ? (
        /* AI SESSIONS TAB CONTENT */
        loading ? (
          /* LOADING STATE PANEL */
          <div className="flex flex-col items-center justify-center py-28 select-none">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4">
              Loading Interview Sessions...
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">
              We're gathering your AI Interview sessions. Please wait a moment
            </p>
          </div>
        ) : allSessions.length === 0 ? (
          /* EMPTY STATE PANEL */
          <div className="flex flex-col items-center justify-center py-28 select-none">
            {/* Clipboard graphic */}
            <div className="relative w-20 h-24 mb-6 opacity-75">
              <div className="absolute top-2 left-2 w-14 h-18 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" />
              <div className="absolute top-0 left-0 w-14 h-18 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex flex-col p-2 space-y-1.5">
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-10 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
                <div className="w-6 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
              </div>
              <div className="absolute -top-1 left-4 w-6 h-3 bg-blue-500 rounded-sm shadow-xs" />
            </div>
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
              No Interview Sessions Yet
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">
              AI Interview sessions will appear here once candidate begin or completes their interview
            </p>
          </div>
        ) : (
          /* ALL SESSIONS DATA TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl p-6 select-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
              All Sessions
            </h3>

            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-2">
                {/* Table Header Row */}
                <div className="bg-slate-100 dark:bg-slate-850/80 text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold px-5 py-3 rounded-lg flex items-center justify-between">
                  <span className="flex-1">Name</span>
                  <span className="w-48">Role</span>
                  <span className="w-24 text-center">Questions</span>
                  <span className="w-24 text-center">Score</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-36 text-center">Date Applied</span>
                  <span className="w-20"></span>
                </div>

                {/* Table Rows */}
                {allSessions.map((session) => {
                  const isCompleted = session.status === "completed";
                  const candName = `${session.profile_id?.first_name || "Helen"} ${session.profile_id?.last_name || "Coker"}`;
                  const candRole = session.job_id?.title || "Virtual Assistant";
                  const questionsProgress = `${session.answers?.length || 0}/${session.questions?.length || 4}`;
                  const scoreValue = isCompleted ? `${session.overall_score || 0}/10` : "0/10";
                  
                  return (
                    <div 
                      key={session._id}
                      onClick={() => handleViewResults(session)}
                      className="px-5 py-3.5 border-b border-slate-50 dark:border-slate-855 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all flex items-center justify-between cursor-pointer"
                    >
                      {/* Name column with avatar */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0">
                          {session.profile_id?.profile_image_url ? (
                            <img 
                              src={session.profile_id.profile_image_url} 
                              alt={candName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {candName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {candName}
                        </span>
                      </div>

                      {/* Role column */}
                      <span className="w-48 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate pr-4">
                        {candRole}
                      </span>

                      {/* Questions progress column */}
                      <span className="w-24 text-center text-xs font-bold text-slate-700 dark:text-slate-330">
                        {questionsProgress}
                      </span>

                      {/* Score column */}
                      <span className="w-24 text-center text-xs font-bold text-slate-700 dark:text-slate-330">
                        {scoreValue}
                      </span>

                      {/* Status badge column */}
                      <div className="w-28 flex justify-center">
                        {isCompleted ? (
                          <span className="bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-[10px] font-bold px-3 py-1 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="bg-yellow-50 dark:bg-yellow-955/20 text-yellow-750 dark:text-yellow-450 border border-yellow-100 dark:border-yellow-900/30 text-[10px] font-bold px-3 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Date Applied column */}
                      <span className="w-36 text-center text-xs font-bold text-slate-550 dark:text-slate-400">
                        {isCompleted ? formatAppliedDate(session.created_at) : "-----------------"}
                      </span>

                      {/* Action View Button */}
                      <div className="w-20 flex justify-end">
                        {session.is_verified ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResults(session);
                            }}
                            className="bg-white dark:bg-slate-900 hover:bg-slate-50 text-blue-500 dark:text-blue-455 border border-blue-200 dark:border-blue-800/80 rounded-full px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.error("This session is not verified yet. Shortlist and view results are locked.");
                            }}
                            className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all opacity-60"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        /* BOOKED MEETS TAB CONTENT */
        bookingsLoading ? (
          /* LOADING STATE PANEL */
          <div className="flex flex-col items-center justify-center py-28 select-none">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4">
              Loading Meetings
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">
              We're gathering your scheduled meetings . Please wait a moment
            </p>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE PANEL */
          <div className="flex flex-col items-center justify-center py-28 select-none">
            {/* Clipboard graphic */}
            <div className="relative w-20 h-24 mb-6 opacity-75">
              <div className="absolute top-2 left-2 w-14 h-18 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" />
              <div className="absolute top-0 left-0 w-14 h-18 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex flex-col p-2 space-y-1.5">
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-10 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
                <div className="w-6 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
              </div>
              <div className="absolute -top-1 left-4 w-6 h-3 bg-blue-500 rounded-sm shadow-xs" />
            </div>
            <h3 className="text-base font-bold text-slate-855 dark:text-slate-100">
              No Meeting Scheduled
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">
              Meeting you booked with candidate will appear here..
            </p>
          </div>
        ) : (
          /* BOOKED MEETS DATA TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 border border-slate-55 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl p-6 select-none">
            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-2">
                {/* Table Header */}
                <div className="bg-slate-100 dark:bg-slate-850/80 text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold px-5 py-3 rounded-lg flex items-center justify-between">
                  <span className="flex-1">Name</span>
                  <span className="w-48">Role</span>
                  <span className="w-24 text-center">AI Score</span>
                  <span className="w-56 text-center">Scheduled Time</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-24"></span>
                </div>

                {/* Table Body rows */}
                <div className="divide-y divide-slate-50 dark:divide-slate-850/50">
                  {bookings.map((booking) => {
                    const candName = `${booking.candidate_id?.first_name || "Helen"} ${booking.candidate_id?.last_name || "Coker"}`;
                    const jobTitle = booking.interview_session_id?.job_id?.title || "Virtual Assistant";
                    const scoreValue = booking.interview_session_id?.overall_score 
                      ? `${booking.interview_session_id.overall_score}/10` 
                      : "-------------";
                    
                    const isBooked = booking.status === "booked";
                    const isPending = booking.status === "pending";
                    const isExpired = booking.status === "expired";

                    return (
                      <div 
                        key={booking._id} 
                        className="px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-855/30 transition-colors flex items-center justify-between gap-4"
                      >
                        {/* Name Column */}
                        <span className="flex-1 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-105 overflow-hidden shrink-0 border border-slate-105 dark:border-slate-800">
                            {booking.candidate_id?.profile_image_url ? (
                              <img
                                src={booking.candidate_id.profile_image_url}
                                alt={candName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                                {candName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {candName}
                          </span>
                        </span>

                        {/* Role Column */}
                        <span className="w-48 text-xs font-semibold text-slate-550 dark:text-slate-400 truncate">
                          {jobTitle}
                        </span>

                        {/* AI Score Column */}
                        <span className="w-24 text-center text-xs font-bold text-slate-700 dark:text-slate-350">
                          {scoreValue}
                        </span>

                        {/* Scheduled Time Column */}
                        <span className="w-56 text-center text-xs font-semibold text-slate-555 dark:text-slate-455">
                          {formatScheduledTime(booking.chosen_slot)}
                        </span>

                        {/* Status Column */}
                        <div className="w-28 flex justify-center">
                          {isBooked && (
                            <span className="bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-[10px] font-bold px-3 py-1 rounded-full">
                              Booked
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-yellow-50 dark:bg-yellow-955/20 text-yellow-750 dark:text-yellow-450 border border-yellow-100 dark:border-yellow-900/30 text-[10px] font-bold px-3 py-1 rounded-full">
                              Pending
                            </span>
                          )}
                          {isExpired && (
                            <span className="bg-red-50 dark:bg-red-955/20 text-red-750 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-[10px] font-bold px-3 py-1 rounded-full">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Action Join Button */}
                        <div className="w-24 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (booking.meet_link) {
                                window.open(booking.meet_link, '_blank');
                              } else {
                                toast.error("No meet link available for this session.");
                              }
                            }}
                            disabled={!booking.meet_link}
                            className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3.5 py-1.5 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs border-none ${
                              !booking.meet_link ? "opacity-40 cursor-not-allowed" : "active:scale-95"
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meet</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Interview Results Modal */}
      <InterviewResultsModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShortlist={(session) => {
          if (!session.is_verified) {
            toast.error("This interview session has not been verified yet.");
            return;
          }
          handleCloseModal();
          setShortlistSession(session);
          setIsShortlistOpen(true);
        }}
      />

      {/* Shortlist Availability Slots Modal */}
      <ShortlistModal
        session={shortlistSession}
        isOpen={isShortlistOpen}
        onClose={handleCloseShortlist}
        onConfirm={handleShortlistConfirm}
      />
    </div>
  );
}
