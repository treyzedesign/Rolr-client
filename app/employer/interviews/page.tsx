"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewSession, EmployerSessionsResponse } from "@/lib/api/interviews";
import { InterviewResultsModal } from "@/components/employer/InterviewResultsModal";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Briefcase, 
  TrendingUp,
  Eye,
  UserCheck,
  Calendar,
  BarChart3
} from "lucide-react";

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
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInterviewSessions();
  }, []);

  const fetchInterviewSessions = async () => {
    try {
      const response: EmployerSessionsResponse = await interviewsApi.getEmployerSessions();
      const sessions = response.sessions;
      
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
        
        // Update status counts
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
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch interview sessions:", err);
      setError("Failed to load interview sessions");
      setLoading(false);
    }
  };

  const handleShortlist = async (sessionId: string, candidateId: string) => {
    try {
      // TODO: Implement shortlist API call
      console.log(`Shortlisting candidate ${candidateId} from session ${sessionId}`);
      // await interviewsApi.shortlistCandidate(sessionId);
    } catch (err) {
      console.error("Failed to shortlist candidate:", err);
    }
  };

  const handleViewResults = (session: InterviewSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading interview sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchInterviewSessions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Sessions</h1>
          <p className="text-slate-600">Track and manage candidate interview progress by job position</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{jobGroups.length}</span>
            </div>
            <p className="text-slate-600 text-sm">Active Jobs</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">
                {jobGroups.reduce((sum, group) => sum + group.stats.total, 0)}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Total Candidates</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">
                {jobGroups.reduce((sum, group) => sum + group.stats.completed, 0)}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Completed</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">
                {jobGroups.reduce((sum, group) => sum + group.stats.inProgress, 0)}
              </span>
            </div>
            <p className="text-slate-600 text-sm">In Progress</p>
          </div>
        </div>

        {/* Job Groups */}
        <div className="space-y-6">
          {jobGroups.map((group, index) => (
            <motion.div
              key={group.job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Job Header */}
              <div className="px-3 py-2 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{group.job.title}</h2>
                    <p className="text-slate-600 text-sm line-clamp-2">{group.job.description}</p>
                  </div>
                  
                  {/* Job Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">{group.stats.total}</div>
                      <div className="text-xs text-slate-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{group.stats.completed}</div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{group.stats.inProgress}</div>
                      <div className="text-xs text-slate-500">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions List */}
              <div className="divide-y divide-slate-100">
                {group.sessions.map((session) => (
                  <div 
                      key={session._id} 
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleViewResults(session)}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Candidate Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {session.profile_id.first_name} {session.profile_id.last_name}
                            </div>
                            <div className="text-sm text-slate-500">
                              Applied {formatDate(session.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)}
                          <span className="capitalize">{session.status.replace('_', ' ')}</span> 
                        </div>
                       
                        {/* Progress */}
                        {session.questions && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <BarChart3 className="w-4 h-4" />
                            <span>
                              {session.answers?.length || 0} / {session.questions.length} questions
                            </span>
                          </div>
                        )}

                        {/* Score */}
                        {session.overall_score && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              Score: {session.overall_score}/10
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {session.status === 'completed' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResults(session);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Results
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShortlist(session._id, session.candidate_id);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              Shortlist
                            </button>
                          </>
                        )}
                        
                        {session.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResults(session);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Progress
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {jobGroups.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Interview Sessions Yet</h3>
            <p className="text-slate-600">Interview sessions will appear here once candidates start applying.</p>
          </div>
        )}
      </div>
    
    {/* Interview Results Modal */}
    <InterviewResultsModal
      session={selectedSession}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
    />
    </div>
  );
}
