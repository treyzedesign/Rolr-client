"use client";

import { useState } from "react";
import { JobSwipeBoard } from "@/components/candidate/JobSwipeBoard";
import { mockJobs } from "@/lib/mock/jobs";
import type { Job } from "@/types/candidate";

export default function DiscoverJobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const handleSwipe = (jobId: string, accepted: boolean) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    
    if (accepted) {
      console.log(`Applied to job: ${jobId}`);
      // TODO: Add to applications
    } else {
      console.log(`Declined job: ${jobId}`);
      // TODO: Add to declined jobs
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          Discover Jobs
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Swipe through job opportunities that match your preferences. Swipe up to apply, down to skip.
        </p>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300">
            All Jobs
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Remote
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Full Time
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Technology
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Design
          </button>
        </div>
      </div>

      {/* Job Discovery */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <JobSwipeBoard jobs={jobs} onSwipe={handleSwipe} />
        </div>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {jobs.length} jobs remaining in your queue
          </p>
        </div>
      )}
    </div>
  );
}
