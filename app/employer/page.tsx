"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { getEmployerJobs } from "@/lib/api/jobs";
import { Job } from "@/types/job";
import { Briefcase, MapPin, Users, Clock } from "lucide-react";
import { getDashboardStats, DashboardStatsResponse } from "@/lib/api/users";

export default function EmployerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsStatsLoading(true);
        setIsJobsLoading(true);
        
        const [statsData, jobsData] = await Promise.all([
          getDashboardStats(),
          getEmployerJobs()
        ]);
        
        setStats(statsData);
        setJobs(jobsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsStatsLoading(false);
        setIsJobsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Section */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back, {user?.fullName || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Here's what's happening with your talent search today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Interviews</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isStatsLoading ? "..." : stats?.stats.interviews.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/50">
              <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Matches</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isStatsLoading ? "..." : stats?.stats.matches.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/50">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Apps</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isStatsLoading ? "..." : stats?.stats.applications.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isStatsLoading ? "..." : stats?.stats.jobs.active || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/employer/discover"
            className="flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700 font-medium transition-all hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Candidates
          </Link>
          
          <Link
            href="/employer/applicants"
            className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-medium transition-all hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Applicants
          </Link>
          
          <Link
            href="/employer/profile"
            className="flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-700 font-medium transition-all hover:bg-purple-100 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Company Profile
          </Link>
          
          <Link
            href="/employer/jobs"
            className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700 font-medium transition-all hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </Link>
        </div>
      </div>

      {/* Active Jobs & Applications */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Your Posted Jobs
          </h2>
          <Link
            href="/employer/jobs"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Manage All Jobs →
          </Link>
        </div>

        {isJobsLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="pb-3 font-medium px-4">Job Title</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4">Location</th>
                  <th className="pb-3 font-medium px-4 text-center">Applications</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{job.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {job.job_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        job.is_active !== false 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
                      }`}>
                        {job.is_active !== false ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-800/50">
                        <Users className="w-4 h-4 mr-1.5" />
                        {job.total_applications || job.applications_count || 0}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        href={`/employer/jobs/${job._id}/candidates`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors"
                      >
                        View Candidates
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No Jobs Posted</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You haven't posted any jobs yet. Post a job to start receiving applications.</p>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
