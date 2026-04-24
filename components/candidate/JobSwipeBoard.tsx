"use client";

import Link from "next/link";
import { motion, useAnimation, useDragControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, Heart, Info } from "lucide-react";
import { JobDetailsModal } from "./JobDetailsModal";
import { swipeJob } from "@/lib/api/swipes";
import type { Job } from "@/types/job";

interface JobSwipeBoardProps {
  jobs: Job[];
  onSwipe: (jobId: string, accepted: boolean) => void;
}

export function JobSwipeBoard({ jobs, onSwipe }: JobSwipeBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const controls = useAnimation();
  const dragControls = useDragControls();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.8, 1, 0.8, 0]);
  const cardScale = useSpring(1, { stiffness: 300, damping: 30 });
  
  const topJob = useMemo(() => jobs[0], [jobs]);
  const nextJob = useMemo(() => jobs[1], [jobs]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!topJob) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
        No more jobs matching your current preferences.
      </div>
    );
  }

  const handleSwipe = async (accepted: boolean) => {
    if (!topJob || isSwiping) return;
    
    setIsSwiping(true);
    
    try {
      // Animate card out immediately
      await controls.start({
        x: accepted ? 300 : -300,
        rotate: accepted ? 30 : -30,
        opacity: 0,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      });
      
      // Notify parent component immediately to show next card
      onSwipe(topJob._id, accepted);
      
      // Call API in background
      await swipeJob({
        job_id: topJob._id,
        action: accepted ? "right" : "left"
      });
      
      // Reset animation controls for next card
      await controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { duration: 0 }
      });
      
    } catch (error) {
      console.error("Swipe failed:", error);
      // If API fails, we could add error notification here
      // but the card already moved to next one
    } finally {
      setIsSwiping(false);
    }
  };

  const formatDescription = (description: string) => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = description;
  return tempDiv.textContent || tempDiv.innerText || description;
};

  const handleDragEnd = async () => {
    setIsDragging(false);
    const threshold = 60; // Reduced from 100 for faster swiping
    const currentX = x.get();
    
    if (Math.abs(currentX) > threshold) {
      await handleSwipe(currentX > 0);
    } else {
      // Snap back to center - faster spring
      await controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 600, damping: 25 }
      });
    }
  };

  const handleCardClick = () => {
    if (!isDragging) {
      setSelectedJob(topJob);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[45vh] max-h-[70vh] overflow-visible"> {/* Allow stack card to be visible */}
      {/* Stack effect - show next card underneath */}
      {nextJob && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-6 shadow-[0_20px_70px_-35px_rgba(59,130,246,0.15)]"
          animate={{
            scale: 0.95,
            y: 10,
            opacity: 0.7
          }}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 25
          }}
        >
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-display text-xl font-semibold text-slate-900">{nextJob.title}</h3>
              <p className="mt-1 text-lg font-medium text-blue-700">{nextJob.employer_name}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main swipe card */}
      <motion.div
        key={topJob._id}
        className="relative h-full rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-4 mb-6 shadow-[0_20px_70px_-35px_rgba(59,130,246,0.35)] cursor-grab active:cursor-grabbing flex flex-col overflow-hidden"
        style={{ x, rotate, opacity }}
        drag={isMobile ? "x" : false}
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Swipe card</p>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
            {jobs.length} left
          </span>
        </div>
        
        {/* Job content - Takes remaining space */}
        <div className="rounded-2xl border border-blue-100 bg-white p-4 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-display text-2xl font-semibold text-slate-900">{topJob.title}</h3>
            <p className="mt-1 text-lg font-medium text-blue-700">
              {topJob.employer_id?.profile?.business_name || topJob.employer_name || 'Company'}
            </p>
            <p className="mt-2 text-sm text-slate-600">{topJob.location}</p>
          </div>
          
          <div className="mb-3">
            {topJob.salary_min && topJob.salary_max && (
              <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 my-1 text-sm font-medium text-emerald-700">
                ${topJob.salary_min.toLocaleString()} - ${topJob.salary_max.toLocaleString()}
              </span>
            )}
            <span className="ml-2 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {topJob.job_type?.replace('_', ' ') || 'N/A'}
            </span>
            <span className="ml-2 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
              {topJob.experience_level}
            </span>
          </div>

          {/* Description - Takes remaining space */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="text-sm text-slate-700 line-clamp-8" 
              dangerouslySetInnerHTML={{ __html: topJob.description }}
            />
          </div>
          
          {topJob.required_skills && topJob.required_skills.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {topJob.required_skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
                {topJob.required_skills.length > 3 && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                    +{topJob.required_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Swipe indicators */}
        <motion.div
          className="absolute top-4 left-4 rounded-full bg-red-500 p-3 shadow-lg"
          animate={{
            opacity: isDragging && x.get() < -30 ? 1 : 0, // Reduced threshold for indicators
            scale: isDragging && x.get() < -30 ? 1 : 0.5
          }}
          transition={{ duration: 0.1 }} // Faster indicator animation
        >
          <X className="w-6 h-6 text-white" />
        </motion.div>
        
        <motion.div
          className="absolute top-4 right-4 rounded-full bg-green-500 p-3 shadow-lg"
          animate={{
            opacity: isDragging && x.get() > 30 ? 1 : 0, // Reduced threshold for indicators
            scale: isDragging && x.get() > 30 ? 1 : 0.5
          }}
          transition={{ duration: 0.1 }} // Faster indicator animation
        >
          <Heart className="w-6 h-6 text-white" />
        </motion.div>

        {/* Mobile swipe hint */}
        {/* {isMobile && (
          <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-600">
            Swipe right to apply • Swipe left to pass
          </p>
        )} */}
      </motion.div>
      
      {/* Action buttons - Always visible below the card */}
      <div className="sticky bottom-2 left-0 right-0 flex justify-center items-center gap-6 px-6">
        <button
          type="button"
          onClick={() => handleSwipe(false)}
          disabled={isSwiping}
          className="w-14 h-14 rounded-full border-2 border-rose-400 bg-white text-rose-500 transition-all hover:bg-rose-50 hover:border-rose-500 hover:scale-110 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white"
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </button>
        <Link
          href={`/candidate/jobs/${topJob._id}`}
          className="w-14 h-14 rounded-full border-2 border-blue-400 bg-white text-blue-500 transition-all hover:bg-blue-50 hover:border-blue-500 hover:scale-110 flex items-center justify-center shadow-lg"
        >
          <Info className="w-7 h-7" strokeWidth={3} />
        </Link>
        <button
          type="button"
          onClick={() => handleSwipe(true)}
          disabled={isSwiping}
          className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-white text-emerald-500 transition-all hover:bg-emerald-50 hover:border-emerald-500 hover:scale-110 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white"
        >
          <Heart className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>
      
      {/* Job Details Modal */}
      <JobDetailsModal 
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}
