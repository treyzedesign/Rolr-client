"use client";

import { motion, useAnimation, useDragControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { X, Heart, Info, MapPin, Briefcase, GraduationCap, Volume2, Play, Pause } from "lucide-react";
import { ApplicantProfileModal } from "./ApplicantProfileModal";
import { swipeCandidate } from "@/lib/api/swipes";
import type { JobApplicant } from "@/types/job";

interface ApplicantSwipeBoardProps {
  applicants: JobApplicant[];
  onSwipe: (applicantId: string, accepted: boolean) => void;
}

export function ApplicantSwipeBoard({ applicants, onSwipe }: ApplicantSwipeBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const controls = useAnimation();
  const dragControls = useDragControls();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.8, 1, 0.8, 0]);

  // PASS / ACCEPT label opacity
  const passLabelOpacity = useTransform(x, [-120, -30, 0], [1, 0.8, 0]);
  const acceptLabelOpacity = useTransform(x, [0, 30, 120], [0, 0.8, 1]);

  const topApplicant = useMemo(() => applicants[0], [applicants]);
  const nextApplicant = useMemo(() => applicants[1], [applicants]);

  const togglePlayPause = () => {
    if (!audioRef.current || !topApplicant.job_seeker_id?.profile?.voice_intro_url) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioLoad = () => {
    setAudioLoaded(true);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioLoaded(false);
    }
  }, [topApplicant]);

  if (!topApplicant || !topApplicant.job_seeker_id?.profile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 max-w-sm shadow-sm select-none">
        No more applicants to review for this job.
      </div>
    );
  }

  const handleSwipe = async (accepted: boolean) => {
    if (!topApplicant || isSwiping) return;
    
    setIsSwiping(true);
    
    try {
      await controls.start({
        x: accepted ? 350 : -350,
        rotate: accepted ? 25 : -25,
        opacity: 0,
        transition: { type: "spring", stiffness: 450, damping: 25 }
      });
      
      onSwipe(topApplicant._id, accepted);
      
      await swipeCandidate({
        candidate_id: topApplicant.job_seeker_id?._id,
        action: accepted ? "right" : "left"
      }).catch(error => {
        console.error("Swipe API failed:", error);
      });
      
      await controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { duration: 0 }
      });
      
    } catch (error) {
      console.error("Animation failed:", error);
    } finally {
      setIsSwiping(false);
    }
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    const threshold = 80;
    const currentX = x.get();
    
    if (Math.abs(currentX) > threshold) {
      await handleSwipe(currentX > 0);
    } else {
      await controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 500, damping: 25 }
      });
    }
  };

  const handleCardClick = () => {
    if (!isDragging && topApplicant.job_seeker_id?.profile) {
      setIsModalOpen(true);
    }
  };

  const profile = topApplicant.job_seeker_id.profile;
  const applicantName = `${profile.first_name || "Helen"} ${profile.last_name || "Coker"}`;
  const applicantRole = topApplicant.job_id?.title || profile.job_category || "Virtual Assistant";

  // Dynamic but stable match score mock
  const matchScore = profile.first_name ? (75 + (profile.first_name.length % 20)) : 80;

  return (
    <div className="relative w-[400px] h-[520px] mx-auto select-none overflow-visible">
      {/* Background card stack effect */}
      {nextApplicant && nextApplicant.job_seeker_id?.profile && (
        <div className="absolute top-2 left-0 right-0 bottom-0 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm scale-95 opacity-70 translate-y-3 pointer-events-none select-none z-0" />
      )}

      {/* Main Drag Card */}
      <motion.div
        key={topApplicant._id}
        className="absolute inset-0 rounded-3xl border border-slate-155 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-md cursor-grab active:cursor-grabbing overflow-hidden z-10"
        style={{ x, rotate, opacity }}
        drag="x"
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={handleCardClick}
      >
        {/* Match score pill (Mockup top left) */}
        {/* <div className="absolute top-4 left-4 bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 pointer-events-none select-none">
          {matchScore}% Match
        </div> */}

        {/* Profile Image Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/90">
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={applicantName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600" />
          )}
        </div>

        {/* Info overlay inside card bottom (Name, Role, Audio Player, Actions) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-32 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-white z-10 select-none flex flex-col gap-4">
          
          {/* Candidate Info Details */}
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {applicantName}
            </h3>
            <p className="text-xs text-white/95 font-medium mt-0.5">
              {applicantRole}
            </p>
            {profile.location && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-white/80 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Voice Bio Player (Positioned just above action buttons) */}
          {profile?.voice_intro_url && (
            <div className="bg-black/10 border border-white/5 rounded-2xl p-2.5 backdrop-blur-[2px]">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1 select-none">
                    <Volume2 className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-[10px] text-white/95 font-bold uppercase tracking-wider">Voice Intro</span>
                  </div>
                  {/* Equalizer animation */}
                  <div className="flex items-end gap-1.5 h-3 pb-0.5">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-white/50 rounded-full"
                        style={{ height: '3px' }}
                        animate={{
                          height: isPlaying ? `${Math.random() * 12 + 3}px` : '3px',
                        }}
                        transition={{
                          duration: 0.3,
                          repeat: isPlaying ? Infinity : 0,
                          repeatType: "reverse",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons centered inside the card overlay (positioned below the audio player) */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {/* Reject button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwipe(false);
              }}
              className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 border-none cursor-pointer"
              title="Reject Candidate"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>

            {/* Profile Info button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-12 h-12 bg-slate-500 hover:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 border-none cursor-pointer"
              title="View Details"
            >
              <span className="text-lg font-bold">i</span>
            </button>

            {/* Match / Approve button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwipe(true);
              }}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 border-none cursor-pointer"
              title="Match Candidate"
            >
              <Heart className="w-5 h-5 fill-current" strokeWidth={3} />
            </button>
          </div>

        </div>

        {/* Drag overlays (PASS/ACCEPT labels) */}
        <motion.div
          className="absolute top-4 right-4 bg-rose-500 text-white px-3.5 py-1.5 rounded-lg shadow font-extrabold text-[10px] pointer-events-none select-none z-20"
          style={{ opacity: passLabelOpacity }}
        >
          PASS
        </motion.div>
        
        <motion.div
          className="absolute top-4 left-4 bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg shadow font-extrabold text-[10px] pointer-events-none select-none z-20"
          style={{ opacity: acceptLabelOpacity }}
        >
          ACCEPT
        </motion.div>
      </motion.div>

      {/* Hidden Audio Element */}
      {profile?.voice_intro_url && (
        <audio
          ref={audioRef}
          src={profile.voice_intro_url}
          onLoadedData={handleAudioLoad}
          onEnded={handleAudioEnd}
          preload="metadata"
        />
      )}

      {/* Applicant Profile Modal */}
      <ApplicantProfileModal
        applicant={topApplicant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
