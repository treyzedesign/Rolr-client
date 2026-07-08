"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, CircleDollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import type { Job } from "@/types/job";

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && job) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, job]);

  if (!mounted) return null;

  const formatDescription = (description: string) => {
    if (typeof window === 'undefined') return description;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    return tempDiv.innerHTML;
  };

  const metadataRow = job ? (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400 select-none">
      <div className="flex items-center gap-1.5">
        <MapPin className="h-4.5 w-4.5 stroke-[2.5] text-slate-400" />
        <span>{job.location || "Location N/A"}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <CircleDollarSign className="h-4.5 w-4.5 stroke-[2.5] text-slate-400" />
        <span>
          {job.salary_min && job.salary_max 
            ? `NGN ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}/month`
            : "Salary N/A"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Briefcase className="h-4.5 w-4.5 stroke-[2.5] text-slate-400" />
        <span>{job.job_type ? (job.job_type === "full_time" ? "Full Time" : job.job_type === "part_time" ? "Part Time" : job.job_type) : "Full Time"}</span>
      </div>
    </div>
  ) : null;

  return (
    <AnimatePresence>
      {isOpen && job && (
        isMobile ? (
          // Mobile Drawer (Right side sliding fullscreen drawer with single outer wrapper)
          <div className="fixed inset-0 z-50 overflow-hidden" key="mobile-drawer">
            {/* Blurry Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px] z-0"
              onClick={onClose}
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute right-0 top-0 h-full w-full bg-white dark:bg-slate-955 z-10 overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 p-5 flex items-center justify-between z-10 flex-shrink-0 select-none">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Details</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable details view */}
              <div className="p-6 space-y-6 flex-1">
                {/* Title and Employer */}
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {job.title}
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg mt-1.5">
                    {job.employer_id?.profile?.business_name || job.employer_name || 'Company'}
                  </p>
                </div>

                {/* Metadata icons */}
                {metadataRow}

                {/* Description and Summary */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Job Summary
                  </h3>
                  <div 
                    className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-455 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                  />
                </div>

                {/* Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2 select-none">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full dark:bg-blue-955/20 dark:text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          // Desktop Modal (Centered dialog with single outer wrapper)
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" key="desktop-modal">
            {/* Blurry Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px] z-0"
              onClick={onClose}
            />
            
            {/* Modal Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-10 flex flex-col border border-slate-50 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header block */}
              <div className="border-b border-slate-100 dark:border-slate-855 p-6 flex items-center justify-between flex-shrink-0 select-none">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Details</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable details view */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Title and Employer */}
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {job.title}
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg mt-1.5">
                    {job.employer_id?.profile?.business_name || job.employer_name || 'Company'}
                  </p>
                </div>

                {/* Metadata icons */}
                {metadataRow}

                {/* Description and Summary */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Job Summary
                  </h3>
                  <div 
                    className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-455 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                  />
                </div>

                {/* Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2 select-none">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full dark:bg-blue-955/20 dark:text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )
      )}
    </AnimatePresence>
  );
}
