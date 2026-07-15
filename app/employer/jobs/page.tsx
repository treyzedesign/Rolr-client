"use client";

import { useEffect, useState } from "react";
import { useJobStore } from "@/stores/job-store";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Plus, Edit, Trash2, Eye, Bell, Clock, Loader2, MapPin } from "lucide-react";
import { CreateJobModal } from "@/components/employer/CreateJobModal";
import { JobDetailsModal } from "@/components/employer/JobDetailsModal";
import type { Job } from "@/types/job";

const JOB_TYPE_LABELS = {
  full_time: "Full Time",
  part_time: "Part Time", 
  contract: "Contract",
  internship: "Internship"
};

export default function EmployerJobsPage() {
  const { user } = useAuthStore();
  const { fetchProfile, getEmployerProfile } = useProfileStore();
  const employerProfile = getEmployerProfile();

  const { 
    employerJobs, 
    isLoading, 
    fetchEmployerJobs, 
    deleteJob,
    isDeleting 
  } = useJobStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchEmployerJobs();
  }, [fetchProfile, fetchEmployerJobs]);

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobToDelete(null);
    } catch (error) {
      // Error handled by store
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    // Ordinal suffix
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";
    
    const year = date.getFullYear();
    return `${month} ${day}${suffix}, ${year}`;
  };

  const employerName = employerProfile?.business_name || employerProfile?.company || user?.fullName || "Employer";
  const emailDisplay = user?.email || "employer@example.com";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching desktop mockup layouts */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your job postings and track applications
          </p>
        </div>
        
        {/* Top-Right Action Controls & Profile widgets */}
        <div className="flex items-center gap-4">
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer border-none bg-blue-600 hover:bg-blue-750 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Job
          </button>
        </div>
      </div>

      {/* JOBS CONTENT PANEL */}
      {isLoading && employerJobs.length === 0 ? (
        /* LOADING STATE */
        <div className="flex flex-col items-center justify-center py-32 select-none">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4">Loading Your Jobs...</h3>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">We're fetching your job listings. This will take a moment.</p>
        </div>
      ) : employerJobs.length === 0 ? (
        /* EMPTY STATE */
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
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">No Jobs Posted Yet</h3>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-sm text-center">Create your first job posting to start attracting qualified candidates</p>
        </div>
      ) : (
        /* DATA STATE */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)] w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Job Title</th>
                  <th className="py-4 px-6">Salary</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Posted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50">
                {employerJobs.map((job) => {
                  const isActive = job.status === "active" || job.is_active !== false;
                  
                  return (
                    <tr 
                      key={job._id} 
                      onClick={() => handleViewDetails(job)}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-850/30 transition-colors cursor-pointer"
                    >
                      {/* Job Title */}
                      <td className="py-5 px-6">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{job.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize flex items-center gap-1.5 select-none">
                          <Clock className="w-3.5 h-3.5" /> {JOB_TYPE_LABELS[job.job_type as keyof typeof JOB_TYPE_LABELS] || job.job_type}
                          {job.location && (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-5 px-6 select-none">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                          {job.salary_min && job.salary_max 
                            ? `NGN ${job.salary_min.toLocaleString()} - NGN ${job.salary_max.toLocaleString()}`
                            : job.salary_min 
                              ? `From NGN ${job.salary_min.toLocaleString()}`
                              : 'Not specified'
                          }
                        </span>
                      </td>

                      {/* Applicants (Overlapping Stack) */}
                      <td className="py-5 px-6 select-none">
                        <div className="flex items-center -space-x-1.5">
                          <div className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xs">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xs">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xs">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 pl-3">
                            +{job.total_applications || job.applications_count || 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6 select-none">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          isActive 
                            ? 'bg-emerald-50/50 text-emerald-600 border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : 'bg-slate-100 text-slate-700 border-slate-250 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
                        }`}>
                          {isActive ? 'Active' : 'Closed'}
                        </span>
                      </td>

                      {/* Date Posted */}
                      <td className="py-5 px-6 select-none text-sm font-semibold text-slate-700 dark:text-slate-350">
                        {formatDate(job.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-2 select-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(job);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-500 text-blue-600 hover:bg-blue-50/50 rounded-full text-xs font-bold transition-all cursor-pointer bg-transparent"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(job);
                            }}
                            className="p-2 border border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer bg-transparent dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-850"
                            title="Edit Job"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobToDelete(job._id);
                            }}
                            className="p-2 border border-rose-100 hover:border-rose-350 text-rose-500 hover:bg-rose-50 rounded-full transition-all cursor-pointer bg-transparent dark:border-slate-800 dark:hover:border-slate-700 dark:text-rose-450 dark:hover:bg-slate-850"
                            title="Delete Job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Job Posting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete this job posting? This action cannot be undone and will remove all associated applications.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(jobToDelete)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold border-none cursor-pointer"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Job Modals */}
      {showCreateModal && (
        <CreateJobModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedJob && (
        <CreateJobModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
          jobToEdit={selectedJob}
        />
      )}

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedJob(null);
          }}
          onEdit={(job) => {
            setShowDetailsModal(false);
            handleEdit(job);
          }}
          onDelete={(jobId) => {
            setShowDetailsModal(false);
            setJobToDelete(jobId);
          }}
        />
      )}
    </div>
  );
}
