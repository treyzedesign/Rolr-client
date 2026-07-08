"use client";

import { motion, useAnimation, useDragControls, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, Heart, MapPin, Briefcase, CircleDollarSign } from "lucide-react";
import { swipeJob } from "@/lib/api/swipes";
import type { Job } from "@/types/job";

interface JobSwipeBoardProps {
  jobs: Job[];
  onSwipe: (jobId: string, accepted: boolean) => void;
  onViewDetails: (job: Job) => void;
}

export function JobSwipeBoard({ jobs, onSwipe, onViewDetails }: JobSwipeBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const controls = useAnimation();
  const dragControls = useDragControls();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 0.9, 1, 0.9, 0.5]);

  // PASS / APPLY label opacity — reactive to drag
  const passLabelOpacity = useTransform(x, [-120, -30, 0], [1, 0.8, 0]);
  const applyLabelOpacity = useTransform(x, [0, 30, 120], [0, 0.8, 1]);

  // Dynamically interpolate properties of Card 2 (middle) based on Card 1's drag position x
  const card2Scale = useTransform(x, [-150, 0, 150], [1, 0.96, 1]);
  const card2Rotate = useTransform(x, [-150, 0, 150], [0, -4, 0]);
  const card2X = useTransform(x, [-150, 0, 150], [0, -4, 0]);
  const card2Y = useTransform(x, [-150, 0, 150], [0, 8, 0]);
  const card2Opacity = useTransform(x, [-150, 0, 150], [0.95, 0.75, 0.95]);

  // Dynamically interpolate properties of Card 3 (bottom) based on Card 1's drag position x
  const card3Scale = useTransform(x, [-150, 0, 150], [0.96, 0.93, 0.96]);
  const card3Rotate = useTransform(x, [-150, 0, 150], [-4, 3, -4]);
  const card3Opacity = useTransform(x, [-150, 0, 150], [0.6, 0.4, 0.6]);

  const topJob = useMemo(() => jobs[0], [jobs]);
  const nextJob = useMemo(() => jobs[1], [jobs]);

  useEffect(() => {
    x.set(0);
  }, [topJob?._id, x]);

  if (!topJob) return null;

  const handleSwipe = async (accepted: boolean) => {
    if (!topJob || isSwiping) return;

    setIsSwiping(true);

    try {
      // Animate card out immediately - fast spring transition
      await controls.start({
        x: accepted ? 300 : -300,
        rotate: accepted ? 30 : -30,
        opacity: 0,
        transition: { type: "spring", stiffness: 600, damping: 20 }
      });

      // Notify parent component immediately to show next card
      onSwipe(topJob._id, accepted);

      // Call API in background without blocking UI
      swipeJob({
        job_id: topJob._id,
        action: accepted ? "right" : "left"
      }).catch(error => {
        console.error("Swipe failed:", error);
      });

      // Reset animation controls for next card
      await controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { duration: 0 }
      });

    } catch (error) {
      console.error("Swipe animation failed:", error);
    } finally {
      setIsSwiping(false);
    }
  };

  const formatDescription = (description: string) => {
    if (typeof window === 'undefined') return description;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    let text = tempDiv.textContent || tempDiv.innerText || description;

    // Clamp at a reasonable character length if too long, ending with trailing dots
    if (text.length > 200) {
      text = text.substring(0, 185) + '...';
    }
    return text;
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    const threshold = 60;
    const currentX = x.get();

    if (Math.abs(currentX) > threshold) {
      await handleSwipe(currentX > 0);
    } else {
      await controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 600, damping: 25 }
      });
    }
  };

  const handleCardClick = () => {
    if (!isDragging) {
      onViewDetails(topJob);
    }
  };

  return (
    <div className="relative w-full max-w-[360px] mx-auto h-[460px] overflow-visible select-none">
      {/* Card 3 (Bottom Stack) - blank card rotated slightly to the right */}
      {jobs.length > 2 && (
        <motion.div
          className="absolute inset-0 rounded-[2.5rem] border border-slate-100/50 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.015)] dark:border-slate-800 dark:bg-slate-900 pointer-events-none"
          style={{
            scale: card3Scale,
            rotate: card3Rotate,
            opacity: card3Opacity
          }}
        />
      )}

      {/* Card 2 (Middle Stack) - displays nextJob details dynamically sizing up */}
      {nextJob && (
        <motion.div
          className="absolute inset-0 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-[0_8px_25px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden dark:border-slate-800 dark:bg-slate-900 pointer-events-none"
          style={{
            scale: card2Scale,
            rotate: card2Rotate,
            x: card2X,
            y: card2Y,
            opacity: card2Opacity
          }}
        >
          {/* Card Inner Content for Next Job */}
          <div className="space-y-4 flex-1 flex flex-col opacity-40">
            {/* Title and Company */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight font-sans dark:text-slate-100">
                {nextJob.title}
              </h3>
              <p className="text-blue-600 font-semibold text-base mt-0.5">
                {nextJob.employer_id?.profile?.business_name || nextJob.employer_name || 'Company'}
              </p>
            </div>

            {/* Job Metadata Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400 select-none">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 stroke-[2.5] text-slate-400" />
                <span>{nextJob.location || "Location N/A"}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4 stroke-[2.5] text-slate-400" />
                <span>
                  {nextJob.salary_min && nextJob.salary_max
                    ? `NGN ${nextJob.salary_min.toLocaleString()} - ${nextJob.salary_max.toLocaleString()}/month`
                    : "Salary N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 stroke-[2.5] text-slate-400" />
                <span>{nextJob.job_type ? (nextJob.job_type === "full_time" ? "Full Time" : nextJob.job_type === "part_time" ? "Part Time" : nextJob.job_type) : "Full Time"}</span>
              </div>
            </div>

            {/* Job Summary */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Job Summary
              </h4>
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed line-clamp-4 dark:text-slate-400">
                {formatDescription(nextJob.description)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Card 1 (Top Drag Card) - contentful layout */}
      <motion.div
        key={topJob._id}
        className="absolute inset-0 rounded-[2.5rem] border border-slate-100 bg-white p-6 pb-20 shadow-[0_15px_45px_rgba(0,0,0,0.05)] cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden dark:border-slate-800 dark:bg-slate-900"
        style={{ x, rotate, opacity }}
        drag="x"
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
        {/* Card Inner Content */}
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Title and Company */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight font-sans dark:text-slate-100">
              {topJob.title}
            </h3>
            <p className="text-blue-600 font-semibold text-base mt-0.5">
              {topJob.employer_id?.profile?.business_name || topJob.employer_name || 'Company'}
            </p>
          </div>

          {/* Job Metadata Row */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400 select-none">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 stroke-[2.5] text-slate-400" />
              <span>{topJob.location || "Location N/A"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CircleDollarSign className="h-4 w-4 stroke-[2.5] text-slate-400" />
              <span>
                {topJob.salary_min && topJob.salary_max
                  ? `NGN ${topJob.salary_min.toLocaleString()} - ${topJob.salary_max.toLocaleString()}/month`
                  : "Salary N/A"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 stroke-[2.5] text-slate-400" />
              <span>{topJob.job_type ? (topJob.job_type === "full_time" ? "Full Time" : topJob.job_type === "part_time" ? "Part Time" : topJob.job_type) : "Full Time"}</span>
            </div>
          </div>

          {/* Job Summary */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Job Summary
            </h4>
            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed line-clamp-4 dark:text-slate-400">
              {formatDescription(topJob.description)}
            </p>
          </div>

          {/* Skills */}
          {topJob.required_skills && topJob.required_skills.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2 mt-2 select-none">
                {topJob.required_skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full dark:bg-blue-950/20 dark:text-blue-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASS label — top-left, reactive to leftward drag */}
        <motion.div
          className="absolute top-6 left-6 bg-[#f82c4f] text-white px-3.5 py-1.5 rounded-lg shadow font-bold text-xs pointer-events-none tracking-wider rotate-[-12deg]"
          style={{ opacity: passLabelOpacity }}
        >
          PASS
        </motion.div>

        {/* APPLY label — top-right, reactive to rightward drag */}
        <motion.div
          className="absolute top-6 right-6 bg-[#2563eb] text-white px-3.5 py-1.5 rounded-lg shadow font-bold text-xs pointer-events-none tracking-wider rotate-[12deg]"
          style={{ opacity: applyLabelOpacity }}
        >
          APPLY
        </motion.div>
      </motion.div>

      {/* Static Swipe Control Buttons overlaying the bottom of the card stack */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-5 select-none z-25">
        {/* Reject button - Solid red */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe(false);
          }}
          disabled={isSwiping}
          className="w-12 h-12 rounded-full bg-[#f82c4f] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(248,44,79,0.3)] hover:scale-115 active:scale-90 transition-all cursor-pointer border-none"
          aria-label="Pass Job"
        >
          <X className="w-5 h-5 stroke-[3px]" />
        </button>

        {/* Info details button - Solid grey */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(topJob);
          }}
          className="w-12 h-12 rounded-full bg-[#e6e8eb] dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-serif text-lg font-bold shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-115 active:scale-90 transition-all cursor-pointer border-none"
          aria-label="Job Details"
        >
          i
        </button>

        {/* Like/Apply button - Solid blue */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe(true);
          }}
          disabled={isSwiping}
          className="w-12 h-12 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:scale-115 active:scale-90 transition-all cursor-pointer border-none"
          aria-label="Apply Job"
        >
          <Heart className="w-5 h-5 fill-white stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}