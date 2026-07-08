"use client";

import { useState, useEffect } from "react";
import { JobSwipeBoard } from "@/components/candidate/JobSwipeBoard";
import { JobDetailsModal } from "@/components/candidate/JobDetailsModal";
import { getJobsWithFilter } from "@/lib/api/jobs";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { Bell } from "lucide-react";
import type { Job } from "@/types/job";

export default function DiscoverJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<"for_you" | "top" | "newest">("for_you");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchJobs();
  }, [currentFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedJobs = await getJobsWithFilter(currentFilter, 1, 20);
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (jobId: string, accepted: boolean) => {
    setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    
    if (accepted) {
      console.log(`Applied to job: ${jobId}`);
      // Application swiping API call is handled internally inside JobSwipeBoard
    } else {
      console.log(`Declined job: ${jobId}`);
    }
  };

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Swipe through personalized jobs recommendations. Swipe right to apply left & right
          </p>
        </div>
        
        {/* Top-Right Info & Actions Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Notification Bell */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* Profile Dropdown / Widget */}
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            {/* Avatar image / initials */}
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
            {/* Text details */}
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

      {/* Filters Pills Section - Contained in a single capsule box */}
      <div className="flex-shrink-0">
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-150 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-xs select-none">
          <button
            onClick={() => setCurrentFilter("for_you")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentFilter === "for_you"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setCurrentFilter("top")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentFilter === "top"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Top Jobs
          </button>
          <button
            onClick={() => setCurrentFilter("newest")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentFilter === "newest"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Main content display - Top-aligned with padding to ensure static layout position */}
      <div className="flex-1 flex flex-col justify-start items-center pt-8 pb-12">
        {loading && (
          <div className="text-center max-w-sm px-4">
            {/* Custom blue spinner loader */}
            <div className="relative flex items-center justify-center w-12 h-12 mx-auto mb-6">
              <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin"></div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Finding Your Next Opportunity...
            </h2>
            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              We're matching you with jobs that fit your skills and preference. This wont take long.
            </p>
          </div>
        )}
        
        {error && !loading && (
          <div className="text-center max-w-sm px-4">
            <div className="text-red-500 text-3xl mb-4">⚠️</div>
            <p className="text-slate-600 mb-4 dark:text-slate-400">{error}</p>
            <button
              onClick={fetchJobs}
              className="rounded-full bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center max-w-md px-4">
            {/* Custom Overlapping Clipboards empty state logo */}
            <div className="relative w-32 h-32 mx-auto mb-6 select-none">
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
              No Available Jobs Right Now
            </h2>
            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              We've run out of matches for the moment. Check back later or update your preference to discover more opportunities
            </p>
          </div>
        )}
        
        {!loading && !error && jobs.length > 0 && (
          <div className="w-full flex items-center justify-center overflow-visible">
            <JobSwipeBoard 
              jobs={jobs} 
              onSwipe={handleSwipe} 
              onViewDetails={(job) => {
                setSelectedJob(job);
                setIsModalOpen(true);
              }}
            />
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
    </div>
  );
}
