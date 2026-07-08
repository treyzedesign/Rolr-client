"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, CircleDollarSign, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { Application } from "@/types/job";

interface ApplicationTimelineProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationTimeline({ application, isOpen, onClose }: ApplicationTimelineProps) {
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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const job = application.job_id;
  if (!job) return null;

  // Format created date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${day} ${month}, ${year} | ${hours}:${minutes} ${ampm}`;
  };

  // Determine stage completion
  const isAppliedCompleted = true;
  const isMatchedCompleted = ["matched", "shortlisted", "selected", "rejected"].includes(application.status);
  const isShortlistedCompleted = ["shortlisted", "selected", "rejected"].includes(application.status);
  const isHiredCompleted = application.status === "selected";

  const timelineSteps = [
    {
      id: "applied",
      label: `Applied to ${job.title} Role`,
      subtext: formatDateTime(application.created_at),
      completed: isAppliedCompleted,
    },
    {
      id: "matched",
      label: "Matched by Employer",
      subtext: isMatchedCompleted ? "Employer reviewed details" : "Pending employer review",
      completed: isMatchedCompleted,
    },
    {
      id: "shortlisted",
      label: "Shortlisted for Interview",
      subtext: isShortlistedCompleted ? "Interview session created" : "Pending shortlist decision",
      completed: isShortlistedCompleted,
    },
    {
      id: "hired",
      label: "Hired by Employer",
      subtext: isHiredCompleted ? "Offer letter delivered" : "Pending final selection",
      completed: isHiredCompleted,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurry Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px] z-0"
            onClick={onClose}
          />
          
          {/* Modal Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-10 flex flex-col border border-slate-50 dark:border-slate-800 p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Header title */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 select-none">
              Status
            </h2>

            {/* Job Title and Employer */}
            <div className="mt-4">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {job.title}
              </h1>
              <p className="text-blue-500 font-semibold text-lg mt-1">
                {job.employer_id?.profile?.business_name || 'Company'}
              </p>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-400 select-none mt-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 stroke-[2.5] text-slate-400" />
                <span>{job.location || "Location N/A"}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <CircleDollarSign className="h-3.5 w-3.5 stroke-[2.5] text-slate-400" />
                <span>
                  {job.salary_min && job.salary_max 
                    ? `NGN ${job.salary_min.toLocaleString()}/month`
                    : "Salary N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 stroke-[2.5] text-slate-400" />
                <span>{job.job_type ? (job.job_type === "full_time" ? "Full Time" : job.job_type === "part_time" ? "Part Time" : job.job_type) : "Full Time"}</span>
              </div>
            </div>

            {/* Timeline Progress box */}
            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 mt-6 flex flex-col flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Progress Timeline
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Estimated Time Delivery is 2:00 PM
              </p>

              {/* Steps container */}
              <div className="mt-5 space-y-6 flex-1 flex flex-col justify-between">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="relative flex gap-4 items-start">
                    {/* Circle indicators */}
                    <div className="relative flex flex-col items-center flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-colors duration-300 ${
                        step.completed
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-blue-300 bg-white dark:bg-slate-900 text-blue-300"
                      }`}>
                        {step.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>
                      
                      {/* Vertical line connector */}
                      {index < timelineSteps.length - 1 && (
                        <div className={`absolute top-6 left-3 -ml-0.5 w-0.5 h-10 border-l-2 border-dashed ${
                          timelineSteps[index + 1].completed 
                            ? "border-blue-500" 
                            : "border-slate-200 dark:border-slate-800"
                        }`} />
                      )}
                    </div>

                    {/* Step descriptions */}
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold transition-colors ${
                        step.completed 
                          ? "text-slate-850 dark:text-slate-100" 
                          : "text-slate-400 dark:text-slate-600"
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400/80 mt-0.5 leading-none">
                        {step.subtext}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
