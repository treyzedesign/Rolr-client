"use client";

import { useState, useEffect } from "react";
import { JobDetailsModal } from "@/components/candidate/JobDetailsModal";
import { ApplicationTimeline } from "@/components/candidate/ApplicationTimeline";
import { applicationsApi } from "@/lib/api/applications";
import type { Application, Job } from "@/types/job";
import { ArrowRight, Clock, CheckCircle, XCircle, Calendar, Send, Eye } from "lucide-react";

export default function CandidateApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [stats, setStats] = useState({
    applied: 0,
    reviewing: 0,
    interviews: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getApplications(1, 50);
      setApplications(response.applications);
      
      // Calculate stats
      const applied = response.applications.length;
      const reviewing = response.applications.filter(app => 
        app.status === 'pending' || app.status === 'reviewing'
      ).length;
      const interviews = response.applications.filter(app => 
        app.status === 'interview_scheduled'
      ).length;
      
      setStats({ applied, reviewing, interviews });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (application: Application) => {
    setSelectedJob(application.job_id);
    setIsModalOpen(true);
  };

  const handleViewTimeline = (application: Application) => {
    setSelectedApplication(application);
    setIsTimelineOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'reviewing':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'accepted':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'rejected':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'interview_scheduled':
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Applied';
      case 'reviewing':
        return 'In Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Send className="w-4 h-4" />;
      case 'reviewing':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
            My Applications
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Track the status of your job applications and employer responses.
          </p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-12"></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="p-6 border-b border-blue-100 dark:border-slate-800">
              <div className="h-6 bg-slate-200 rounded w-32"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border-b border-blue-100 dark:border-slate-800">
                <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          My Applications
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Track the status of your job applications and employer responses.
        </p>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Applied</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.applied}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-amber-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Review</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.reviewing}</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-emerald-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Interviews</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.interviews}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-xl border border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="p-6 border-b border-blue-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Recent Applications ({applications.length})
          </h3>
        </div>
        
        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
              <Send className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start applying for jobs to see them here
            </p>
            <a
              href="/candidate/discover"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Discover Jobs
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="divide-y divide-blue-100 dark:divide-slate-800">
            {applications.map((application) => (
              <div 
                key={application._id} 
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => handleViewTimeline(application)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {application.job_id.title}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-sky-300 mb-2">
                          {application.job_id.employer_id?.profile?.business_name || 'Company'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Applied {formatDate(application.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {getStatusLabel(application.status)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(application);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />

      {/* Application Timeline Modal */}
      {selectedApplication && (
        <ApplicationTimeline
          application={selectedApplication}
          isOpen={isTimelineOpen}
          onClose={() => {
            setIsTimelineOpen(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}
