"use client";

import { X, MapPin, Briefcase, GraduationCap, DollarSign, Users, Trash2, Edit } from "lucide-react";
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

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
}

export function JobDetailsModal({ job, isOpen, onClose, onEdit, onDelete }: JobDetailsModalProps) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col select-none">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Job Title & Company */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {job.title}
            </h1>
            <p className="text-blue-500 font-semibold text-sm mt-1">
              {job.employer_name || job.employer_id?.profile?.business_name || "Pace Tech"}
            </p>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-450 border-b border-slate-50 dark:border-slate-850 pb-5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>
                {job.salary_min && job.salary_max 
                  ? `NGN ${job.salary_min.toLocaleString()} - NGN ${job.salary_max.toLocaleString()}`
                  : job.salary_min 
                    ? `From NGN ${job.salary_min.toLocaleString()}`
                    : 'Not specified'
                }
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{JOB_TYPE_LABELS[job.job_type as keyof typeof JOB_TYPE_LABELS] || job.job_type}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>{EXPERIENCE_LABELS[job.experience_level as keyof typeof EXPERIENCE_LABELS] || job.experience_level}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <div className="flex items-center -space-x-1.5 ml-1">
                <div className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 pl-2">
                  +{job.total_applications || job.applications_count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Job Summary Section */}
          {job.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-2">
                Job Summary
              </h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-slate-600 dark:text-slate-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          )}

          {/* Required Skills Badges */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-2.5">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3.5 py-1.5 bg-blue-50/80 text-blue-650 border border-blue-100/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 rounded-full text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Delete & Edit Buttons) */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
            {onDelete && (
              <button
                onClick={() => onDelete(job._id)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50/50 rounded-full text-xs font-bold transition-all cursor-pointer bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(job)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-blue-500 text-blue-600 hover:bg-blue-50/50 rounded-full text-xs font-bold transition-all cursor-pointer bg-transparent"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
