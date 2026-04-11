"use client";

import { useState } from "react";
import { JobSwipeBoard } from "@/components/candidate/JobSwipeBoard";
import { mockJobs } from "@/lib/mock/jobs";
import type { Job } from "@/types/candidate";

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const handleSwipe = (jobId: string, accepted: boolean) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    
    if (accepted) {
      console.log(`Applied to job: ${jobId}`);
      // TODO: Add application logic
    } else {
      console.log(`Declined job: ${jobId}`);
      // TODO: Add decline logic
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, Job Seeker!
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Discover your next opportunity with our swipe-based job discovery.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Jobs Available</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{jobs.length}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 013 12a9.001 9.001 0 019-9 9.001 9.001 0 019 9.255z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-emerald-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">12</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-purple-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Profile Views</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">47</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-amber-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Matches</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">8</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Job Discovery Section */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Discover Jobs
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <JobSwipeBoard jobs={jobs} onSwipe={handleSwipe} />
          </div>
        </div>
      </div>
    </div>
  );
}
