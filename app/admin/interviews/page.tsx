"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  Building,
  Video,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  X,
  Volume2,
  Play,
  Pause,
  CheckCircle,
  Activity,
  Award,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminAllInterviews, AdminInterviewSessionResponse, adminVerifyInterview } from "@/lib/api/admin";
import type { InterviewSession } from "@/lib/api/interviews";
import toast from "react-hot-toast";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getEmployerEmail = (session: InterviewSession): string => {
  if (!session) return "No employer info";
  
  if (typeof session.employer_id === "object" && session.employer_id !== null) {
    const email = (session.employer_id as any).email;
    if (email) return email;
  }
  
  const jobEmployer = (session.job_id as any)?.employer_id;
  if (typeof jobEmployer === "object" && jobEmployer !== null) {
    if (jobEmployer.email) return jobEmployer.email;
  }
  
  if (typeof jobEmployer === "string" && jobEmployer.includes("@")) {
    return jobEmployer;
  }
  
  if (typeof session.employer_id === "string" && session.employer_id.includes("@")) {
    return session.employer_id;
  }

  const directEmployerEmail = (session.job_id as any)?.employer_email;
  if (directEmployerEmail) return directEmployerEmail;

  return "employer@workswipe.com";
};

export default function AdminInterviewsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  const handleVerifyInterview = async (sessionId: string) => {
    try {
      await adminVerifyInterview(sessionId);
      toast.success("Interview session verified successfully!");
      
      // Update local sessions state
      setSessions(prev => 
        prev.map(s => s._id === sessionId ? { ...s, is_verified: true } : s)
      );
      
      // Update selectedSession if it is currently open
      setSelectedSession(prev => 
        prev && prev._id === sessionId ? { ...prev, is_verified: true } : prev
      );
    } catch (error: any) {
      console.error("Failed to verify interview:", error);
      const errMsg = error?.response?.data?.message || "Failed to verify interview session";
      toast.error(errMsg);
      throw error;
    }
  };

  const fetchInterviews = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const response = await getAdminAllInterviews(statusFilter, page, pagination.limit);
      setSessions(response.sessions || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
      });

      // Expand the first job by default if sessions are loaded
      if (response.sessions && response.sessions.length > 0) {
        const firstJobId = response.sessions[0].job_id?._id || "unassigned";
        setExpandedJobs(prev => ({ [firstJobId]: true, ...prev }));
      }
    } catch (error) {
      console.error("Failed to fetch admin interviews:", error);
      toast.error("Failed to load interview sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews(1);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchInterviews(newPage);
    }
  };

  // Group interviews by Job ID
  const groupedJobs = useMemo(() => {
    const groups: Record<string, {
      jobId: string;
      title: string;
      description: string;
      sessions: InterviewSession[];
    }> = {};

    sessions.forEach((session) => {
      const jobId = session.job_id?._id || "unassigned";
      const jobTitle = session.job_id?.title || "Unassigned / General Interviews";

      if (!groups[jobId]) {
        groups[jobId] = {
          jobId,
          title: jobTitle,
          description: session.job_id?.description || "No job description available",
          sessions: [],
        };
      }
      groups[jobId].sessions.push(session);
    });

    // Apply search filter locally on candidate name or job title
    const filtered = Object.values(groups).map((group) => {
      const matchingSessions = group.sessions.filter((session) => {
        const candidateName = `${session.profile_id?.first_name || ""} ${session.profile_id?.last_name || ""}`.toLowerCase();
        const jobTitle = group.title.toLowerCase();
        const query = search.toLowerCase();
        return candidateName.includes(query) || jobTitle.includes(query);
      });

      return {
        ...group,
        sessions: matchingSessions,
      };
    }).filter((group) => group.sessions.length > 0);

    return filtered;
  }, [sessions, search]);

  const toggleJobExpanded = (jobId: string) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "expired":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 6) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">AI Interview Monitor</h1>
          <p className="text-slate-400">Oversee all AI-driven candidate interviews grouped by role</p>
        </div>
        <button
          onClick={() => fetchInterviews()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all font-medium self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by candidate name or job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm transition-all"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:text-sm appearance-none transition-all"
            >
              <option value="all">All Sessions</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Accordions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-1/4"></div>
                </div>
                <div className="h-8 bg-slate-800 rounded-lg w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : groupedJobs.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
          <FolderOpen className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No interviews matched</h3>
          <p className="max-w-md mx-auto text-sm text-slate-400">
            No interview sessions were found matching your current search or status filter. Try clearing filters or resetting the status criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedJobs.map((group) => {
            const isExpanded = !!expandedJobs[group.jobId];
            return (
              <div
                key={group.jobId}
                className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700/80"
              >
                {/* Job Group Header */}
                <button
                  onClick={() => toggleJobExpanded(group.jobId)}
                  className="w-full flex items-center justify-between p-5 text-left border-b border-slate-800/50 bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 hidden sm:block shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-white tracking-tight truncate pr-2">
                        {group.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Employer: <span className="text-cyan-400 font-medium">{group.sessions[0] ? getEmployerEmail(group.sessions[0]) : "employer@workswipe.com"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {group.sessions.length} {group.sessions.length === 1 ? "Session" : "Sessions"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Candidate Table */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="overflow-x-auto border-t border-slate-800/40">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-950/40 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                              <th className="px-6 py-3.5">Candidate</th>
                              <th className="px-6 py-3.5">Education & Exp</th>
                              <th className="px-6 py-3.5">Status</th>
                              <th className="px-6 py-3.5">Score</th>
                              <th className="px-6 py-3.5">Created Date</th>
                              <th className="px-6 py-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 bg-slate-950/10">
                            {group.sessions.map((session) => {
                              const candidateName = session.profile_id
                                ? `${session.profile_id.first_name} ${session.profile_id.last_name}`
                                : "Unspecified Candidate";

                              const hasVoiceAnswer = session.answers?.some(a => a.audio_url);

                              return (
                                <tr key={session._id} className="hover:bg-slate-900/40 transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-slate-400" />
                                      </div>
                                      <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                        {candidateName}
                                        {session.candidate_id.is_rolr_verified && (
                                          <span title="Verified by Admin" className="shrink-0 flex items-center">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {session.profile_id ? (
                                      <>
                                        <div className="text-sm text-slate-300 font-medium">
                                          {session.profile_id.education_level}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          {session.profile_id.experience_years} {session.profile_id.experience_years === 1 ? "year" : "years"} experience
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-slate-600 text-xs">No profile info</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(session.status)}`}>
                                      <span className="w-1 h-1 rounded-full bg-current"></span>
                                      <span className="capitalize">{session.status.replace("_", " ")}</span>
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {session.overall_score !== undefined ? (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-sm font-bold border ${getScoreColor(session.overall_score)}`}>
                                        <Award className="w-3.5 h-3.5" />
                                        {session.overall_score}/10
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-600 font-medium">Not Scored</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-xs text-slate-300 flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                      {formatDate(session.created_at)}
                                    </div>
                                    {hasVoiceAnswer && (
                                      <div className="text-[10px] text-cyan-400 flex items-center gap-0.5 mt-1 font-semibold">
                                        <Volume2 className="w-3 h-3" /> Voice Response Included
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    {session.is_verified &&
                                      <button
                                        className="px-3.5 mr-1 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:text-white  border--500/20 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                                      >
                                        verified
                                      </button>
                                    }
                                    <button
                                      onClick={() => setSelectedSession(session)}
                                      className="px-3.5 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                                    >
                                      Review AI Feedback
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mt-6">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{sessions.length}</span> of{" "}
            <span className="font-semibold text-white">{pagination.total}</span> interviews
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
              className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-300 font-semibold px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || isLoading}
              className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dark Themed AI Results Details Modal */}
      <AnimatePresence>
        {selectedSession && (
          <DetailModal
            session={selectedSession}
            isOpen={true}
            onClose={() => setSelectedSession(null)}
            getBadgeStyles={getStatusBadgeStyles}
            getScoreColor={getScoreColor}
            onVerify={handleVerifyInterview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Detailed Modal Component adapted to Dark Mode */
interface DetailModalProps {
  session: InterviewSession;
  isOpen: boolean;
  onClose: () => void;
  getBadgeStyles: (status: string) => string;
  getScoreColor: (score: number) => string;
  onVerify?: (sessionId: string) => Promise<void>;
}

function DetailModal({ session, isOpen, onClose, getBadgeStyles, getScoreColor, onVerify }: DetailModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyClick = async () => {
    if (!onVerify) return;
    setIsVerifying(true);
    try {
      await onVerify(session._id);
    } catch (err) {
      // Parent displays toast
    } finally {
      setIsVerifying(false);
    }
  };

  const getAnswerScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-rose-400";
  };

  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const candidateName = session.profile_id
    ? `${session.profile_id.first_name} ${session.profile_id.last_name}`
    : "Unspecified Candidate";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-slate-800/80 p-6 bg-slate-950/40 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                  AI Interview Feedback Report
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
                  {candidateName}
                </h2>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                    <span>{session.job_id?.title || "General Interview"}</span>
                  </div>
                  <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyles(session.status)}`}>
                    <span className="capitalize">{session.status.replace("_", " ")}</span>
                  </div>
                  {session.overall_score !== undefined && (
                    <>
                      <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(session.overall_score)}`}>
                        <Award className="w-3.5 h-3.5 text-current" />
                        Overall Score: {session.overall_score}/10
                      </span>
                    </>
                  )}
                  {session.is_verified && (
                    <>
                      <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/10">
            {/* Candidate Profile Details Card */}
            {session.profile_id && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" /> Candidate Profile Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3.5">
                    <span className="text-xs text-slate-500 block">Education Credentials</span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      {session.profile_id.education_level}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3.5">
                    <span className="text-xs text-slate-500 block">Experience Level</span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      {session.profile_id.experience_years} Years Professional Experience
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-slate-500 block mb-2">Verified Professional Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {session.profile_id.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-950/20 border border-slate-850 rounded-xl">
                <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Session Started</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    {formatDateWithTime(session.started_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-950/20 border border-slate-850 rounded-xl">
                <CheckCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Session Completed</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    {formatDateWithTime(session.completed_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Summary Review */}
            {session.summary && (
              <div className="bg-gradient-to-r from-cyan-950/30 to-slate-950/30 border border-cyan-900/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TrendingUp className="w-24 h-24 text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Comprehensive AI Evaluation
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line relative z-10">
                  {session.summary}
                </p>
              </div>
            )}

            {/* Questions & Answers Thread */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" /> Detailed Interview Transcripts
              </h3>

              {session.questions.map((question) => {
                const answer = session.answers?.find(a => a.question_index === question.index);
                const isAudio = !!answer?.audio_url;

                return (
                  <div key={question._id} className="border border-slate-800/80 rounded-2xl bg-slate-950/20 p-5 space-y-4 hover:border-slate-700/60 transition-colors">
                    {/* Question Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          Q{question.index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${question.type === "behavioural"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : question.type === "situational"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                          {question.type}
                        </span>
                        {isAudio && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 animate-pulse" /> Voice
                          </span>
                        )}
                      </div>

                      {answer && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${getAnswerScoreColor(answer.score)}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>AI Score: {answer.score}/10</span>
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <div>
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {question.text}
                      </p>
                    </div>

                    {/* Candidate Answer */}
                    {answer ? (
                      <div className="border-l-2 border-cyan-500/30 pl-4 space-y-3">
                        {isAudio ? (
                          <AudioPlayer url={answer.audio_url!} />
                        ) : (
                          <p className="text-sm text-slate-300 bg-slate-900/20 p-3 rounded-xl border border-slate-850/60 leading-relaxed">
                            {answer.text}
                          </p>
                        )}

                        {/* AI Question Feedback */}
                        {answer.feedback && (
                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                            <div className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> AI Feedback Breakdown
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {answer.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic py-2 pl-4 border-l border-slate-800">
                        Candidate skipped or did not submit an answer for this question yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-800/80 p-6 bg-slate-950/40 flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Session Ref: {session._id.substring(0, 10)}... • Created {formatDate(session.created_at)}
            </span>
            <div className="flex items-center gap-3">
              {onVerify && session.status === "completed" && (
                session.is_verified ? (
                  <span className="px-4 py-2 text-sm font-semibold text-emerald-400 flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl select-none">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Verified by Admin
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyClick}
                    disabled={isVerifying}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                    {isVerifying ? "Verifying..." : "Verify Interview"}
                  </button>
                )
              )}
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* Voice Player Component */
function AudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 my-2 bg-slate-900/40">
      <button
        onClick={toggle}
        className="w-11 h-11 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/20 text-cyan-400 transition-all shrink-0 cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Candidate Voice Recording</span>
        </div>
        <div className="flex items-center gap-1 h-3.5">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-cyan-500/30 rounded-full"
              style={{ height: "3px" }}
              animate={{ height: isPlaying ? `${Math.random() * 12 + 3}px` : "3px" }}
              transition={{ duration: 0.25, repeat: isPlaying ? Infinity : 0, repeatType: "reverse", delay: i * 0.02 }}
            />
          ))}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}
