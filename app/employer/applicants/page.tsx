"use client";

import { useState, useEffect } from "react";
import { ApplicantSwipeBoard } from "@/components/employer/ApplicantSwipeBoard";
import { getEmployerJobs } from "@/lib/api/jobs";
import { applicationsApi } from "@/lib/api/applications";
import type { Job } from "@/types/job";
import type { JobApplicant } from "@/types/job";
import { ChevronDown, Users, Briefcase, Loader2 } from "lucide-react";

export default function ApplicantsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});

  // Fetch employer's jobs on mount
  useEffect(() => {
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
  }, []);

  // Fetch applicants when job is selected
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJob) return;
      
      try {
        setLoadingApplicants(true);
        setError(null);
        
        const response = await applicationsApi.getJobApplicants(
          selectedJob._id,
          1, // page
          50, // limit - get more applicants for swiping
          "submitted" // status
        );
        
        setApplicants(response.applicants);
        
        // Update the applicant count for this job
        setApplicantCounts(prev => ({
          ...prev,
          [selectedJob._id]: response.applicants.length
        }));
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
        setError("Failed to load applicants for this job");
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [selectedJob]);

  const handleSwipe = (applicantId: string, accepted: boolean) => {
    // Remove the swiped applicant from the list
    setApplicants(prev => prev.filter(applicant => applicant._id !== applicantId));
    
    // Here you could also make an API call to update the application status
    // For example: updateApplicationStatus(applicantId, accepted ? "approved" : "rejected")
    console.log(`Applicant ${applicantId} ${accepted ? "accepted" : "rejected"}`);
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Review Applicants</h1>
          <p className="text-slate-600">
            Swipe through candidates who applied to your job postings
          </p>
        </div>

        {/* Mobile View - Dropdown */}
        <div className="md:hidden">
          {/* Job Selection Dropdown */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white rounded-2xl border border-blue-200 px-6 py-4 text-left shadow-lg hover:shadow-xl transition-shadow flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    {selectedJob ? (
                      <div>
                        <p className="font-semibold text-slate-900">{selectedJob.title}</p>
                        <p className="text-sm text-slate-600">{selectedJob.location}</p>
                      </div>
                    ) : (
                      <p className="text-slate-600">Select a job to view applicants</p>
                    )}
                  </div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} 
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-blue-200 shadow-xl z-50 max-h-64 overflow-y-auto">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <button
                        key={job._id}
                        onClick={() => handleJobSelect(job)}
                        className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors border-b border-blue-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{job.title}</p>
                            <p className="text-sm text-slate-600 truncate">{job.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center text-xs text-blue-600">
                                <Users className="w-3 h-3 mr-1" />
                                {applicantCounts[job._id] || job.applications_count || 0} applicants
                              </span>
                              <span className="text-xs text-slate-500">
                                {job.job_type?.replace('_', ' ') || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-center text-slate-600">
                      No job postings found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Mobile Swipe Board */}
          <div className="flex justify-center">
            {loadingApplicants ? (
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600">Loading applicants...</p>
                </div>
              </div>
            ) : selectedJob ? (
              <ApplicantSwipeBoard 
                applicants={applicants}
                onSwipe={handleSwipe}
              />
            ) : (
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
                  <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="font-medium mb-2">No Job Selected</p>
                  <p className="text-sm">Please select a job from the dropdown above to view applicants</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View - Jobs List and Swipe Board */}
        <div className="hidden md:block">
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jobs List - Left Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    Your Job Postings
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto">
                  {jobs.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {jobs.map((job) => (
                        <button
                          key={job._id}
                          onClick={() => handleJobSelect(job)}
                          className={`w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors ${
                            selectedJob?._id === job._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate pr-2">
                                {job.title}
                              </h3>
                              <p className="text-sm text-slate-600 truncate mt-1">
                                {job.location}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center text-xs text-blue-600">
                                  <Users className="w-3 h-3 mr-1" />
                                  {applicantCounts[job._id] || job.applications_count || 0} applicants
                                </span>
                                <span className="text-xs text-slate-500">
                                  {job.job_type?.replace('_', ' ') || 'N/A'}
                                </span>
                              </div>
                            </div>
                            {selectedJob?._id === job._id && (
                              <div className="w-1 h-12 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center text-slate-600">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="font-medium">No job postings found</p>
                      <p className="text-sm mt-1">Create your first job posting to start reviewing applicants</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Swipe Board - Right Side */}
            <div className="lg:col-span-2">
              {loadingApplicants ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-slate-600">Loading applicants...</p>
                    </div>
                  </div>
                </div>
              ) : selectedJob ? (
                <div className="flex justify-center">
                  <ApplicantSwipeBoard 
                    applicants={applicants}
                    onSwipe={handleSwipe}
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
                      <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="font-medium mb-2">Select a Job</p>
                      <p className="text-sm">Choose a job from the list to start reviewing applicants</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
