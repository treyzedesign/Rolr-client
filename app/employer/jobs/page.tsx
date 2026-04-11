"use client";

import { useEffect, useState } from "react";
import { useJobStore } from "@/stores/job-store";
import { Plus, Edit, Trash2, Eye, Briefcase, MapPin, Clock, DollarSign, Users } from "lucide-react";
import { CreateJobModal } from "@/components/employer/CreateJobModal";
import { JobDetailsModal } from "@/components/employer/JobDetailsModal";
import { truncateHtml, stripHtml } from "@/utils/html";
import type { Job } from "@/types/job";

const JOB_TYPE_LABELS = {
  full_time: "Full Time",
  part_time: "Part Time", 
  contract: "Contract",
  internship: "Internship"
};

const EXPERIENCE_LABELS = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level"
};

export default function EmployerJobsPage() {
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
    fetchEmployerJobs();
  }, [fetchEmployerJobs]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && employerJobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Job Management</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Manage your job postings and track applications
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {employerJobs.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {employerJobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {employerJobs.filter(job => job.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Active Jobs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {employerJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Jobs Posted Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Get started by posting your first job opening
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type & Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {employerJobs.map((job) => (
                    <tr 
                      key={job._id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => handleViewDetails(job)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {stripHtml(truncateHtml(job.description, 100))}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {JOB_TYPE_LABELS[job.job_type]}
                          </span>
                          <div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                              {EXPERIENCE_LABELS[job.experience_level]}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-100">
                            {job.salary_min && job.salary_max 
                              ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                              : job.salary_min 
                                ? `From ${job.salary_min.toLocaleString()}`
                                : 'Not specified'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-100">
                            {job.applications_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : job.status === 'closed'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}>
                          {job.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {job.created_at ? formatDate(job.created_at) : 'Recently'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(job);
                            }}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            title="View Job Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(job);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Edit Job"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobToDelete(job._id);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete Job"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {jobToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Delete Job Posting
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to delete this job posting? This action cannot be undone and will remove all associated applications.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setJobToDelete(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(jobToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          />
        )}
      </div>
    </div>
  );
}
