"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, DollarSign, Users, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import type { Job } from "@/types/job";

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!job) return null;

  const formatDescription = (description: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    return tempDiv.innerHTML;
  };

  if (isMobile) {
    // Mobile Drawer
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full bg-white z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h1>
                  <p className="text-lg font-medium text-blue-600 mb-1">{job.employer_id?.profile?.business_name || job.employer_name || 'Company'}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.job_type?.replace('_', ' ') || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Job Info */}
                <div className="grid grid-cols-2 gap-4">
                  {job.salary_min && job.salary_max && (
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Salary</span>
                      </div>
                      <p className="text-lg font-semibold text-emerald-800">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-800 capitalize">
                      {job.experience_level}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h3>
                  <div 
                    className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                  />
                </div>

                {/* Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posted Date */}
                {job.created_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Modal
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{job.title}</h2>
                  <p className="text-lg font-medium text-blue-600">{job.employer_id?.profile?.business_name || job.employer_name || 'Company'}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                {/* Job Info */}
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.job_type?.replace('_', ' ') || 'N/A'}
                  </div>
                  {job.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Salary and Experience */}
                <div className="grid grid-cols-2 gap-4">
                  {job.salary_min && job.salary_max && (
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-700 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Salary Range</span>
                      </div>
                      <p className="text-xl font-semibold text-emerald-800">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Experience Level</span>
                    </div>
                    <p className="text-xl font-semibold text-purple-800 capitalize">
                      {job.experience_level}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h3>
                  <div 
                    className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                  />
                </div>

                {/* Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
