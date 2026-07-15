"use client";

import { useState, useEffect } from "react";
import { ApplicantSwipeBoard } from "@/components/employer/ApplicantSwipeBoard";
import { ApplicantProfileModal } from "@/components/employer/ApplicantProfileModal";
import { getEmployerJobs } from "@/lib/api/jobs";
import { applicationsApi } from "@/lib/api/applications";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import type { Job } from "@/types/job";
import type { JobApplicant } from "@/types/job";
import { ChevronDown, Loader2, Bell, MapPin, Briefcase } from "lucide-react";

export default function ApplicantsPage() {
  const { user } = useAuthStore();
  const { fetchProfile, getEmployerProfile } = useProfileStore();
  const employerProfile = getEmployerProfile();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"applicants" | "matches">("applicants");
  
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [matches, setMatches] = useState<JobApplicant[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});

  // Matched candidate profile details modal state
  const [selectedMatch, setSelectedMatch] = useState<JobApplicant | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Fetch employer profile and jobs on mount
  useEffect(() => {
    fetchProfile();
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const employerJobs = await getEmployerJobs();
        setJobs(employerJobs);
        
        // Auto-select first job if available
        if (employerJobs.length > 0) {
          setSelectedJob(employerJobs[0]);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load your job postings");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [fetchProfile]);

  // Fetch applicants and matches when job is selected
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJob) return;
      
      try {
        setLoadingApplicants(true);
        setError(null);
        
        // Fetch submitted applicants (for My Applications)
        const responseApplicants = await applicationsApi.getJobApplicants(
          selectedJob._id,
          1,
          50,
          "submitted"
        );
        setApplicants(responseApplicants.applicants);
        
        // Fetch matched/shortlisted applicants (for My Matches)
        const responseMatches = await applicationsApi.getJobApplicants(
          selectedJob._id,
          1,
          50,
          "matched"
        );
        setMatches(responseMatches.applicants);
        
        // Update counts
        setApplicantCounts(prev => ({
          ...prev,
          [`${selectedJob._id}_applicants`]: responseApplicants.applicants.length,
          [`${selectedJob._id}_matches`]: responseMatches.applicants.length
        }));
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
        setError("Failed to load applicants for this job");
        setApplicants([]);
        setMatches([]);
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [selectedJob]);

  const handleSwipe = (applicantId: string, accepted: boolean) => {
    if (activeTab === "applicants") {
      const swipedApplicant = applicants.find(app => app._id === applicantId);
      setApplicants(prev => prev.filter(app => app._id !== applicantId));
      
      // If approved, dynamically append to matches list for premium UX feel
      if (accepted && swipedApplicant) {
        setMatches(prev => [...prev, swipedApplicant]);
        if (selectedJob) {
          setApplicantCounts(prev => ({
            ...prev,
            [`${selectedJob._id}_applicants`]: Math.max(0, (prev[`${selectedJob._id}_applicants`] || 0) - 1),
            [`${selectedJob._id}_matches`]: (prev[`${selectedJob._id}_matches`] || 0) + 1
          }));
        }
      } else if (selectedJob) {
        setApplicantCounts(prev => ({
          ...prev,
          [`${selectedJob._id}_applicants`]: Math.max(0, (prev[`${selectedJob._id}_applicants`] || 0) - 1)
        }));
      }
    } else {
      setMatches(prev => prev.filter(app => app._id !== applicantId));
      if (selectedJob) {
        setApplicantCounts(prev => ({
          ...prev,
          [`${selectedJob._id}_matches`]: Math.max(0, (prev[`${selectedJob._id}_matches`] || 0) - 1)
        }));
      }
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setDropdownOpen(false);
  };

  const employerName = employerProfile?.business_name || employerProfile?.company || user?.fullName || "Employer";
  const emailDisplay = user?.email || "employer@example.com";

  const displayedApplicantsCount = selectedJob ? (applicantCounts[`${selectedJob._id}_applicants`] ?? applicants.length) : 0;
  const displayedMatchesCount = selectedJob ? (applicantCounts[`${selectedJob._id}_matches`] ?? matches.length) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching desktop layouts */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Candidates
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Swipe through candidates who applied to your job postings
          </p>
        </div>
        
        {/* Top-Right Action Controls & Profile widgets */}
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

      {/* Sub-Header (Tabs and Dropdown Filter Row) */}
      <div className="flex flex-wrap items-center gap-3 select-none">
        <button
          onClick={() => setActiveTab("applicants")}
          className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all border border-transparent cursor-pointer ${
            activeTab === "applicants"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-350 border-slate-205 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          My Applications - {displayedApplicantsCount}
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all border border-transparent cursor-pointer ${
            activeTab === "matches"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-350 border-slate-205 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          My Matches - {displayedMatchesCount}
        </button>

        {/* Job Selection Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {selectedJob ? selectedJob.title : "Select Job Post"}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <ul className="absolute left-0 mt-1.5 w-60 z-50 rounded-2xl border border-slate-150 bg-white py-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950 max-h-60 overflow-y-auto">
              {jobs.map((job) => (
                <li key={job._id}>
                  <button
                    onClick={() => handleJobSelect(job)}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex flex-col gap-0.5 border-none bg-transparent cursor-pointer"
                  >
                    <span className="truncate">{job.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{job.location}</span>
                  </button>
                </li>
              ))}
              {jobs.length === 0 && (
                <li className="px-4 py-2.5 text-xs text-slate-450 italic select-none">
                  No job postings found
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-medium text-red-700 max-w-sm">
          {error}
        </div>
      )}

      {/* Main Review Panels */}
      {loading || loadingApplicants ? (
        /* LOADING STATE */
        activeTab === "matches" ? (
          <div className="flex flex-col items-center justify-center py-32 select-none">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4">Loading Your Best Matches...</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">We're gathering your preferred candidates</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 select-none">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4">Loading Applications...</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">We're gathering the latest applications for your jobs.</p>
          </div>
        )
      ) : activeTab === "applicants" ? (
        /* MY APPLICATIONS / REVIEW TAB */
        applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 select-none">
            {/* Custom Clipboard Graphic */}
            <div className="relative w-20 h-24 mb-6 opacity-75">
              <div className="absolute top-2 left-2 w-14 h-18 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" />
              <div className="absolute top-0 left-0 w-14 h-18 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex flex-col p-2 space-y-1.5">
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-10 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
                <div className="w-6 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
              </div>
              <div className="absolute -top-1 left-4 w-6 h-3 bg-blue-500 rounded-sm shadow-xs" />
            </div>
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">No Application Yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">Once candidates apply to your job postings, they'll appear here</p>
          </div>
        ) : (
          <div className="flex justify-center select-none py-6">
            <ApplicantSwipeBoard 
              applicants={applicants}
              onSwipe={handleSwipe}
            />
          </div>
        )
      ) : (
        /* MY MATCHES TAB */
        matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 select-none">
            {/* Clipboard Empty Graphic matching Matches view */}
            <div className="relative w-20 h-24 mb-6 opacity-75">
              <div className="absolute top-2 left-2 w-14 h-18 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm" />
              <div className="absolute top-0 left-0 w-14 h-18 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex flex-col p-2 space-y-1.5">
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-10 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
                <div className="w-6 h-1 bg-slate-150 dark:bg-slate-900 rounded-full" />
              </div>
              <div className="absolute -top-1 left-4 w-6 h-3 bg-blue-500 rounded-sm shadow-xs" />
            </div>
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">No Matches Found Yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">You don't have any match yet, right swipe to get a match</p>
          </div>
        ) : (
          /* Grid list of matched candidate cards */
          <div className="flex flex-wrap gap-6 pt-2 select-none">
            {matches.map((match) => {
              const profile = match.job_seeker_id?.profile;
              if (!profile) return null;
              
              const matchName = `${profile.first_name || "Helen"} ${profile.last_name || "Coker"}`;
              const matchRole = match.job_id?.title || profile.job_category || "Customer Support";

              return (
                <div 
                  key={match._id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setMatchModalOpen(true);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer relative flex flex-col justify-between w-[290px] h-[230px] shrink-0"
                >
                  <div>
                    {/* Top Row: Avatar, Info, Matched Badge */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-800">
                        {profile.profile_image_url ? (
                          <img 
                            src={profile.profile_image_url} 
                            alt={matchName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {matchName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-12">
                        <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 truncate">
                          {matchName}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                          {matchRole}
                        </p>
                      </div>

                      {/* Matched Pill top-right */}
                      <span className="absolute top-5 right-5 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                        Matched
                      </span>
                    </div>

                    {/* Metadata: Location & Experience Level */}
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 font-bold">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {profile.location}
                        </span>
                      )}
                      {profile.experience_level && (
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {profile.experience_level} Level
                        </span>
                      )}
                    </div>

                    {/* Bio Paragraph */}
                    {profile.bio && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2.5 line-clamp-3">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Skills tags list */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profile.skills.slice(0, 3).map((skill) => (
                        <span 
                          key={skill}
                          className="bg-blue-50/50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 rounded-full px-2.5 py-0.5 text-[9px] font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Matched Candidate Details Profile Modal */}
      <ApplicantProfileModal
        applicant={selectedMatch}
        isOpen={matchModalOpen}
        onClose={() => {
          setSelectedMatch(null);
          setMatchModalOpen(false);
        }}
      />
    </div>
  );
}
