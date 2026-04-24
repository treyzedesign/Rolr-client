"use client";

import { useState, useEffect } from "react";
import { JobSwipeBoard } from "@/components/candidate/JobSwipeBoard";
import { getJobsWithFilter } from "@/lib/api/jobs";
import type { Job } from "@/types/job";

export default function DiscoverJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<"for_you" | "top" | "newest">("for_you");

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
      // TODO: Add to applications API call
    } else {
      console.log(`Declined job: ${jobId}`);
      // TODO: Add to declined jobs API call
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchJobs}
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 pt-1">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          Discover Jobs
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Swipe through personalized job recommendations. Swipe right to apply, left to pass.
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex-shrink-0 px-6 pb-4">
        <div className="rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentFilter("for_you")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                currentFilter === "for_you"
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setCurrentFilter("top")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                currentFilter === "top"
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Top Jobs
            </button>
            <button
              onClick={() => setCurrentFilter("newest")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                currentFilter === "newest"
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      {/* Job Discovery - Takes remaining space */}
      <div className="flex-1 flex  px-6 ">
        <div className="w-full max-w-sm ">
          <JobSwipeBoard jobs={jobs} onSwipe={handleSwipe} />
        </div>
      </div>
    </div>
  );
}
