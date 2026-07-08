"use client";

import { useState, useEffect } from "react";
import { JobDetailsModal } from "@/components/candidate/JobDetailsModal";
import { ApplicationTimeline } from "@/components/candidate/ApplicationTimeline";
import { applicationsApi } from "@/lib/api/applications";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { Application, Job } from "@/types/job";
import { Calendar, Bell } from "lucide-react";

export default function CandidateApplications() {
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "weekly" | "monthly">("today");

  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  useEffect(() => {
    setMounted(true);
    fetchApplications();
    fetchProfile();
  }, [fetchProfile]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getApplications(1, 50);
      setApplications(response.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimeline = (application: Application) => {
    setSelectedApplication(application);
    setIsTimelineOpen(true);
  };

  // Filter applications by age based on selected tab
  const filteredApplications = applications.filter((app) => {
    const appDate = new Date(app.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - appDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeFilter === "today") {
      return diffDays <= 1;
    }
    if (timeFilter === "weekly") {
      return diffDays <= 7;
    }
    if (timeFilter === "monthly") {
      return diffDays <= 30;
    }
    return true;
  });

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track the status of your job applications and employers response
          </p>
        </div>
        
        {/* Top-Right Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Bell */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
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
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time filters Pills row - Shown only when not loading */}
      {!loading && (
        <div className="flex-shrink-0 select-none">
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-150 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => setTimeFilter("today")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                timeFilter === "today"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter("weekly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                timeFilter === "weekly"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFilter("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                timeFilter === "monthly"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      )}

      {/* Display Body area */}
      <div className="flex-1 flex flex-col justify-start">
        {/* 1. Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center pt-24 text-center">
            <div className="relative flex items-center justify-center w-12 h-12 mb-6 select-none">
              <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin"></div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Loading Your Applications
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              We're gathering your latest applications. It'll be ready in a moment.
            </p>
          </div>
        )}

        {/* 2. Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center pt-24 max-w-sm mx-auto text-center">
            {/* Custom Overlapping Clipboards vector decoration */}
            <div className="relative w-32 h-32 mb-6 select-none">
              {/* Back clipboard */}
              <div className="absolute top-2 left-4 w-20 h-24 border-2 border-slate-200 bg-white rounded-xl shadow-sm rotate-[-8deg] dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto w-6 h-2 bg-slate-100 rounded-b border-r border-l border-b border-slate-200 mt-0"></div>
              </div>
              {/* Front clipboard */}
              <div className="absolute top-4 left-8 w-20 h-24 border-2 border-slate-200 bg-white rounded-xl shadow-md rotate-[4deg] dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center">
                {/* Blue head */}
                <div className="absolute -top-1 w-10 h-3 bg-blue-500 rounded-b flex items-center justify-center shadow-xs">
                  <div className="w-5 h-1 bg-blue-600 rounded"></div>
                </div>
                {/* Lines */}
                <div className="space-y-1.5 w-12 mt-3">
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded w-8"></div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded w-10"></div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded w-7"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No Applications Yet
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You haven't applied to any jobs. click on the button below to start swiping
            </p>
            <a
              href="/candidate/discover"
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all text-center select-none cursor-pointer"
            >
              Go to Jobs
            </a>
          </div>
        )}

        {/* 3. Grid list of applications */}
        {!loading && filteredApplications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {filteredApplications.map((app) => {
              const appJob = app.job_id;
              if (!appJob) return null;
              return (
                <div 
                  key={app._id}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100/85 dark:border-slate-800/85 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between relative hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] transition-all group"
                >
                  {/* Card top */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate max-w-[70%]">
                        {appJob.title}
                      </h3>
                      <span className="bg-blue-600 text-white rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none flex-shrink-0">
                        Applied
                      </span>
                    </div>
                    <p className="text-blue-500 font-semibold text-sm mt-0.5 truncate max-w-[85%]">
                      {appJob.employer_id?.profile?.business_name || 'Company'}
                    </p>
                    
                    {/* Date stamp row */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-6 select-none">
                      <Calendar className="h-4 w-4 stroke-[2.5]" />
                      <span>Applied on {new Date(app.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>

                  {/* Action status button */}
                  <button
                    onClick={() => handleViewTimeline(app)}
                    className="w-full mt-6 py-2.5 rounded-full border border-blue-600 text-blue-600 text-xs font-bold hover:bg-blue-50 active:scale-95 transition-all cursor-pointer border-solid bg-transparent dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-955/15"
                  >
                    Track Status
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details page-level modal wrapper */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />

      {/* Timeline page-level modal wrapper */}
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
