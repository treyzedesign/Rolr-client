"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { getEmployerJobs } from "@/lib/api/jobs";
import { getDashboardStats, DashboardStatsResponse } from "@/lib/api/users";
import { Job } from "@/types/job";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { 
  Bell, 
  Briefcase, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight, 
  Heart, 
  FileText, 
  CheckCircle, 
  CheckCircle2, 
  Circle, 
  X, 
  Check, 
  Loader2 
} from "lucide-react";

export default function EmployerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProfile, getEmployerProfile, isLoading: isProfileLoading } = useProfileStore();
  const employerProfile = getEmployerProfile();
  
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isProfileSetupClosed, setIsProfileSetupClosed] = useState(false);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchStatsAndJobs();
  }, [fetchProfile]);

  const fetchStatsAndJobs = async () => {
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

  // Calculate employer profile completion checklist
  const getChecklistData = () => {
    if (!employerProfile) {
      return {
        percentage: 0,
        incompleteCount: 3,
        items: [
          { id: "company", label: "Add Company Information", completed: false },
          { id: "contact", label: "Add Contact Information", completed: false },
          { id: "hiring", label: "Add Hiring Preference", completed: false },
        ]
      };
    }

    const items = [
      {
        id: "company",
        label: "Add Company Information",
        completed: !!((employerProfile.business_name || employerProfile.company) && employerProfile.industry && employerProfile.bio),
      },
      {
        id: "contact",
        label: "Add Contact Information",
        completed: !!(employerProfile.contact_person_name && employerProfile.contact_person_role && employerProfile.phone),
      },
      {
        id: "hiring",
        label: "Add Hiring Preference",
        completed: !!(employerProfile.expected_hiring_timeline && employerProfile.expected_hiring_timeline !== "" as any),
      },
    ];

    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    const incompleteCount = items.length - completedCount;

    return { percentage, incompleteCount, items };
  };

  const { percentage, incompleteCount, items } = getChecklistData();

  // Mapping statistics
  const interviewsCount = stats?.stats.interviews.total || 0;
  const matchesCount = stats?.stats.matches.total || 0;
  const totalAppsCount = stats?.stats.applications.total || 0;
  const activeJobsCount = stats?.stats.jobs.active || 0;
  const hiredCount = stats?.stats.applications.approved || 0;

  const employerName = employerProfile?.business_name || employerProfile?.company || user?.fullName || "Employer";
  const emailDisplay = user?.email || "employer@example.com";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching candidate redesign */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Good Morning, {employerName}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with your talent search today
          </p>
        </div>
        
        {/* Top-Right Profile Widget */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {employerProfile?.profile_image_url ? (
                <img 
                  src={employerProfile.profile_image_url} 
                  alt="avatar" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                employerName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Employer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Company Profile Banner - Hidden when profile is 100% complete */}
      {percentage < 100 && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 dark:bg-blue-950/20 dark:border-blue-900/50 shadow-sm select-none">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Complete Your Company Profile
          </h2>
          <p className="mt-1 text-sm text-blue-700/80 dark:text-blue-300/80">
            Finish setting your profile to attract talents
          </p>
        </div>
      )}

      {/* 5-Column Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Interviews */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Interviews
            </span>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : interviewsCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Scheduled candidate interviews
            </p>
          </div>
        </div>

        {/* 2. Total Matches */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Matches
            </span>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : matchesCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Best candidate you right swiped
            </p>
          </div>
        </div>

        {/* 3. Total Applications */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Applications
            </span>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : totalAppsCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Application received
            </p>
          </div>
        </div>

        {/* 4. Active Jobs */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Jobs
            </span>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : activeJobsCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Live Job posting
            </p>
          </div>
        </div>

        {/* 5. Total Hired */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Hired
            </span>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : hiredCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Candidates hired
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Column: Company Profile Setup Checklist Card */}
        {!isProfileSetupClosed && (
          <div className="lg:col-span-5 max-w-2xl rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                Company Profile Setup
              </h2>
              {percentage === 100 && (
                <button 
                  onClick={() => setIsProfileSetupClosed(true)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-850 dark:hover:text-slate-200 transition-colors border-none bg-transparent cursor-pointer"
                  aria-label="Dismiss setup card"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Blue Inner Banner */}
            <div className="rounded-lg bg-blue-50/50 border border-blue-100/50 p-4 dark:bg-blue-950/10 dark:border-blue-900/20 select-none">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {percentage === 100 ? "Profile Completed" : "Complete Your Profile"}
              </h3>
              <p className="mt-0.5 text-xs text-blue-700/80 dark:text-blue-300/80">
                {percentage === 100 
                  ? "Your chances of getting talents has been increased" 
                  : "Finish setting your profile to attract talents"}
              </p>
            </div>

            {/* Progress Checklist Header */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60 select-none">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Profile ({isProfileLoading ? "..." : `${percentage}%`})
              </span>
              {percentage < 100 && incompleteCount > 0 && !isProfileLoading && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {incompleteCount}
                </div>
              )}
            </div>

            {/* Interactive Checklist Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-b border-slate-100 dark:border-slate-800/60">
              {items.map((item) => (
                item.completed ? (
                  <div key={item.id} className="flex items-center gap-3 py-3.5 select-none opacity-60">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-sm font-medium text-slate-450 dark:text-slate-550">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/employer/profile?edit=${item.id}`)}
                    className="flex w-full items-center justify-between py-3.5 text-left text-slate-700 hover:text-blue-600 dark:text-slate-350 dark:hover:text-sky-400 group transition-all border-none bg-transparent cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-blue-500 text-base font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* Right Side Column: Actions & Posted Jobs */}
        <div className={`${!isProfileSetupClosed ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
          {/* Quick Actions Grid */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 select-none">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/employer/discover"
                className="flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-750 font-semibold text-sm transition-all hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                Discover Candidates
              </Link>
              
              <Link
                href="/employer/applicants"
                className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-755 font-semibold text-sm transition-all hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              >
                View Applicants
              </Link>
              
              <Link
                href="/employer/profile"
                className="flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-755 font-semibold text-sm transition-all hover:bg-purple-100 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
              >
                Company Profile
              </Link>
              
              <Link
                href="/employer/jobs"
                className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-755 font-semibold text-sm transition-all hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40"
              >
                Post New Job
              </Link>
            </div>
          </div>

          {/* Posted Jobs */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm">
            <div className="mb-6 flex items-center justify-between select-none">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                Your Posted Jobs
              </h2>
              <Link
                href="/employer/jobs"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Manage All Jobs &rarr;
              </Link>
            </div>

            {isJobsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 px-4">Job Title</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Location</th>
                      <th className="pb-3 px-4 text-center">Applications</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {jobs.slice(0, 5).map((job) => (
                      <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{job.title}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {job.job_type.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            job.is_active !== false 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
                          }`}>
                            {job.is_active !== false ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-350">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg font-semibold text-xs border border-blue-100/50 dark:border-blue-800/50">
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            {job.total_applications || job.applications_count || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link 
                            href={`/employer/jobs/${job._id}/candidates`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors border border-transparent"
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
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 select-none">No Jobs Posted</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 select-none">You haven't posted any jobs yet. Post a job to start receiving applications.</p>
                <Link
                  href="/employer/jobs/new"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 border-none"
                >
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
