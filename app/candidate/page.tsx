"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { getDashboardStats, DashboardStatsResponse } from "@/lib/api/users";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { 
  Bell, 
  ArrowRight, 
  Heart, 
  Eye, 
  Calendar, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Loader2,
  Check,
  X
} from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile, isLoading: isProfileLoading } = useProfileStore();
  const candidateProfile = getCandidateProfile();
  
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isProfileSetupClosed, setIsProfileSetupClosed] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile]);

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Calculate completion checklist
  const getChecklistData = () => {
    if (!candidateProfile) {
      return {
        percentage: 0,
        incompleteCount: 6,
        items: [
          { id: "basic", label: "Add Basic Information", completed: false },
          { id: "voiceIntro", label: "Add Voice Introduction", completed: false },
          { id: "professional", label: "Add Professional Information", completed: false },
          { id: "education", label: "Add Education", completed: false },
          { id: "jobPreferences", label: "Add Job Preference", completed: false },
          { id: "portfolio", label: "Add Portfolio & Links", completed: false },
        ]
      };
    }

    const items = [
      {
        id: "basic",
        label: "Add Basic Information",
        completed: !!(candidateProfile.first_name && candidateProfile.last_name),
      },
      {
        id: "voiceIntro",
        label: "Add Voice Introduction",
        completed: !!(candidateProfile.voice_intro_url || candidateProfile.video_intro_url || candidateProfile.audio_url),
      },
      {
        id: "professional",
        label: "Add Professional Information",
        completed: !!candidateProfile.job_category,
      },
      {
        id: "education",
        label: "Add Education",
        completed: !!(candidateProfile.education_level),
      },
      {
        id: "jobPreferences",
        label: "Add Job Preference",
        completed: !!(candidateProfile.preferred_salary_min),
      },
      {
        id: "portfolio",
        label: "Add Portfolio & Links",
        completed: !!(candidateProfile.portfolio_url || candidateProfile.linkedin_url),
      },
    ];

    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    const incompleteCount = items.length - completedCount;

    return { percentage, incompleteCount, items };
  };

  const { percentage, incompleteCount, items } = getChecklistData();

  // Mapping statistics
  const rightSwipesCount = stats?.stats.applications.total || 0;
  const matchesCount = stats?.stats.matches.total || 0;
  const inReviewCount = stats?.stats.applications.pending || stats?.stats.applications.submitted || 0;
  const interviewInvitesCount = stats?.stats.interviews.total || 0;
  const offersReceivedCount = stats?.stats.applications.approved || 0;

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {candidateName}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discover your next opportunity with our swipe-based job discovery
          </p>
        </div>
        
        {/* Top-Right Info & Actions Bar */}
        <div className="hidden md:flex flex-wrap items-center gap-4">
          <ThemeToggle />
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

          {/* Discover Jobs button */}
          <Link
            href="/candidate/discover"
            className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Discover Jobs
          </Link>
        </div>
      </div>

      {/* Complete your profile status banner - Hidden when profile is 100% complete */}
      {percentage < 100 && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 dark:bg-blue-950/20 dark:border-blue-900/50 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Complete Your Profile
          </h2>
          <p className="mt-1 text-sm text-blue-700/80 dark:text-blue-300/80">
            Complete your profile to increase your chances of getting hired
          </p>
        </div>
      )}

      {/* Row of 5 statistic cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Right Swipes */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Right Swipes
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : rightSwipesCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Job you are interested in
            </p>
          </div>
        </div>

        {/* Matches */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Matches
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : matchesCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Mutual interest from employers
            </p>
          </div>
        </div>

        {/* In Review */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              In Review
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : inReviewCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Application being reviewed
            </p>
          </div>
        </div>

        {/* Interview Invites */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Interview Invites
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : interviewInvitesCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Invites from employers
            </p>
          </div>
        </div>

        {/* Offers Received */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Offers Received
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : offersReceivedCount}
            </span>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Job offers
            </p>
          </div>
        </div>
      </div>

      {/* Profile Setup Checklist card */}
      {!isProfileSetupClosed && (
        <div className="max-w-2xl rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
              Profile Setup
            </h2>
            {/* Close button shown on profile setup card */}
            <button 
              onClick={() => setIsProfileSetupClosed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-850 dark:hover:text-slate-200 transition-colors"
              aria-label="Dismiss setup card"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mini Inner Banner */}
          <div className="rounded-lg bg-blue-50/50 border border-blue-100/50 p-4 dark:bg-blue-950/10 dark:border-blue-900/20">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {percentage === 100 ? "Profile Completed" : "Complete Your Profile"}
            </h3>
            <p className="mt-0.5 text-xs text-blue-700/80 dark:text-blue-300/80">
              {percentage === 100 
                ? "Your chances of getting hired has been increased" 
                : "Complete your profile to increase your chances of getting hired"}
            </p>
          </div>

          {/* Progress Display */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Profile ({isProfileLoading ? "..." : `${percentage}%`})
            </span>
            {percentage < 100 && incompleteCount > 0 && !isProfileLoading && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {incompleteCount}
              </div>
            )}
          </div>

          {/* Checklist */}
          {percentage === 100 ? (
            /* Layout for completed state */
            <div className="bg-slate-50/60 border border-slate-100/80 rounded-xl p-4 dark:bg-slate-800/20 dark:border-slate-850 space-y-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1 text-slate-400 dark:text-slate-500 select-none"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Layout for incomplete or progressive states */
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-b border-slate-100 dark:border-slate-800/60">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/candidate/profile?edit=${item.id}`)}
                  className="flex w-full items-center justify-between py-3.5 text-left text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-400 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500 animate-scaleIn">
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                    )}
                    <span className={`text-sm font-medium ${item.completed ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.label}
                    </span>
                  </div>
                  {!item.completed && (
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all dark:text-slate-600 dark:group-hover:text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
