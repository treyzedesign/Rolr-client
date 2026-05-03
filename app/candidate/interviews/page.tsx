"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { interviewsApi } from "@/lib/api/interviews";
import type { CandidateInterviewSession } from "@/lib/api/interviews";
import { Video, Clock, CheckCircle, AlertCircle, Loader2, Briefcase, Calendar } from "lucide-react";

export default function InterviewSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CandidateInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidate's interview sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await interviewsApi.getCandidateSessions();
        console.log("Sessions API response:", response);
        setSessions(response.sessions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch interview sessions:", err);
        setError("Failed to load your interview sessions");
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStartInterview = (sessionId: string) => {
    router.push(`/candidate/interviews/session?session=${sessionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ready to Start";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your interview sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Interview Sessions</h1>
          <p className="text-slate-600">
            Manage and complete your AI interview sessions
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Interview Sessions</h3>
            <p className="text-slate-600 mb-6">
              You don't have any interview sessions yet. Complete your profile and start applying to jobs to receive interview invitations.
            </p>
            <button
              onClick={() => router.push('/candidate/discover')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Discover Jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {session.job_id?.title || 'Interview Session'}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Time Remaining */}
                    {session.status === "pending" && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          {formatTimeRemaining(session.expires_at)}
                        </span>
                      </div>
                    )}

                    {/* Questions Count */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Questions:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {session.questions?.length || 0} questions
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100">
                      {session.status === "pending" ? (
                        <button
                          onClick={() => handleStartInterview(session._id)}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Start Interview
                        </button>
                      ) : session.status === "in_progress" ? (
                        <button
                          onClick={() => handleStartInterview(session._id)}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Continue Interview
                        </button>
                      ) : session.status === "completed" ? (
                        <div className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Interview Completed
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Interview Expired
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {sessions.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Interview Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Before You Start</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Find a quiet place with stable internet connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Ensure you have 60-90 minutes of uninterrupted time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Complete the interview before it expires</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">During the Interview</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Answer each question thoughtfully (minimum 30 words)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You have 60 seconds per question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Be honest and showcase your best qualities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
