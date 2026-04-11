"use client";

import { X, MapPin, Clock, DollarSign, Users, Briefcase, Calendar } from "lucide-react";
import type { Job } from "@/types/job";
import { stripHtml } from "@/utils/html";

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

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
  if (!isOpen || !job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {formatDate(job.created_at)}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Job Type
                </span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {JOB_TYPE_LABELS[job.job_type]}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Experience Level
                </span>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                {EXPERIENCE_LABELS[job.experience_level]}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Salary Range
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {job.salary_min && job.salary_max 
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : job.salary_min 
                    ? `From $${job.salary_min.toLocaleString()}`
                    : 'Not specified'
                }
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Applications
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {job.applications_count || 0} applicants
              </p>
            </div>
          </div>

          {/* Job Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
              Status:
            </span>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
              job.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : job.status === 'closed'
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
            }`}>
              {job.status || 'active'}
            </span>
          </div>

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Job Description
            </h3>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert text-slate-700 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
