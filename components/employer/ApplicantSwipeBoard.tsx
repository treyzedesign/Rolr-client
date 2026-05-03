"use client";

import { motion, useAnimation, useDragControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { X, Heart, Info, MapPin, Briefcase, GraduationCap, DollarSign, Play, Pause, Volume2 } from "lucide-react";
import { ApplicantProfileModal } from "./ApplicantProfileModal";
import { swipeCandidate } from "@/lib/api/swipes";
import type { JobApplicant } from "@/types/job";

interface ApplicantSwipeBoardProps {
  applicants: JobApplicant[];
  onSwipe: (applicantId: string, accepted: boolean) => void;
}

export function ApplicantSwipeBoard({ applicants, onSwipe }: ApplicantSwipeBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
  const cardScale = useSpring(1, { stiffness: 300, damping: 30 });

  // Reactive button transforms based on drag position
  const passButtonSize = useTransform(x, [-150, -30, 0], ["4rem", "4rem", "3.5rem"]);
  const passButtonBg = useTransform(x, [-150, -30, 0], ["#f43f5e", "#f43f5e", "#ffffff"]);
  const passButtonBorder = useTransform(x, [-150, -30, 0], ["#f43f5e", "#f43f5e", "#f87171"]);
  const passButtonColor = useTransform(x, [-150, -30, 0], ["#ffffff", "#ffffff", "#f43f5e"]);
  const passButtonScale = useTransform(x, [-150, -30, 0], [1.2, 1.2, 1]);

  const acceptButtonSize = useTransform(x, [0, 30, 150], ["3.5rem", "4rem", "4rem"]);
  const acceptButtonBg = useTransform(x, [0, 30, 150], ["#ffffff", "#10b981", "#10b981"]);
  const acceptButtonBorder = useTransform(x, [0, 30, 150], ["#34d399", "#10b981", "#10b981"]);
  const acceptButtonColor = useTransform(x, [0, 30, 150], ["#10b981", "#ffffff", "#ffffff"]);
  const acceptButtonScale = useTransform(x, [0, 30, 150], [1, 1.2, 1.2]);

  // PASS / ACCEPT label opacity
  const passLabelOpacity = useTransform(x, [-150, -30, 0], [1, 1, 0]);
  const acceptLabelOpacity = useTransform(x, [0, 30, 150], [0, 1, 1]);

  const topApplicant = useMemo(() => applicants[0], [applicants]);
  const nextApplicant = useMemo(() => applicants[1], [applicants]);

  // Voice player functions
  const togglePlayPause = () => {
    if (!audioRef.current || !topApplicant.job_seeker_id.profile.voice_intro_url) return;
    
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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cleanup audio when applicant changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioLoaded(false);
    }
  }, [topApplicant]);

  if (!topApplicant) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
        No more applicants to review for this job.
      </div>
    );
  }

  const handleSwipe = async (accepted: boolean) => {
    if (!topApplicant || isSwiping) return;
    
    setIsSwiping(true);
    
    try {
      // Animate card out immediately
      await controls.start({
        x: accepted ? 300 : -300,
        rotate: accepted ? 30 : -30,
        opacity: 0,
        transition: { type: "spring", stiffness: 600, damping: 20 }
      });
      
      // Notify parent component immediately to show next card
      onSwipe(topApplicant._id, accepted);
      
      // Call API to record the swipe
      await swipeCandidate({
        candidate_id: topApplicant.job_seeker_id._id,
        action: accepted ? "right" : "left"
      }).catch(error => {
        console.error("Swipe API failed:", error);
      });
      
      // Reset animation controls for next card
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
    if (!isDragging && topApplicant.job_seeker_id.profile) {
      setIsModalOpen(true);
    }
  };

  const profile = topApplicant.job_seeker_id.profile;

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[60vh] max-h-[75vh] overflow-visible">
      {/* Stack effect - show next card underneath */}
      {nextApplicant && nextApplicant.job_seeker_id.profile && (
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
              <h3 className="font-display text-xl font-semibold text-slate-900">
                {nextApplicant.job_seeker_id.profile.first_name} {nextApplicant.job_seeker_id.profile.last_name || 'Applicant'}
              </h3>
              <p className="mt-1 text-lg font-medium text-blue-700">Next Applicant</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main swipe card */}
      <motion.div
        key={topApplicant._id}
        className="relative h-full rounded-3xl border border-blue-100 bg-white mb-6 shadow-[0_20px_70px_-35px_rgba(59,130,246,0.35)] cursor-grab active:cursor-grabbing overflow-hidden"
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
        {/* Profile Image Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60">
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600" />
          )}
        </div>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/90">Applicant Card</p>
            <span className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white">
              {applicants.length} left
            </span>
          </div>
        </div>


        {/* Applicant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="text-white">
            <h3 className="font-display text-3xl font-bold mb-1">
              {profile?.first_name} {profile?.last_name}
            </h3>
            {/* <p className="text-white/90 mb-3">{topApplicant.job_seeker_id.email}</p> */}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {profile?.location && (
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white/90">
                  <MapPin className="w-3 h-3 mr-1" />
                  {profile.location}
                </span>
              )}
              {profile?.experience_level && (
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white/90">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {profile.experience_level}
                </span>
              )}
              {profile?.job_category && (
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white/90">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {profile.job_category}
                </span>
              )}
            </div>

            {/* {profile?.employment_status && (
              <p className="text-sm text-white/80">
                Status: <span className="text-white/90">{profile.employment_status}</span>
              </p>
            )} */}
          </div>
        </div>

        {/* Voice Player Overlay - Bottom with Transparent Background */}
        {profile?.voice_intro_url && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-transparent border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-3 h-3 text-white/80" />
                    <span className="text-xs text-white/90">Voice Introduction</span>
                  </div>
                  {/* Simple equalizer visualization */}
                  <div className="flex items-center gap-1 h-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-white/40 rounded-full"
                        style={{ height: '2px' }}
                        animate={{
                          height: isPlaying ? `${Math.random() * 16 + 2}px` : '2px',
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
          </div>
        )}

        {/* PASS label — top-left, reactive to leftward drag */}
        <motion.div
          className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg shadow font-bold text-xs pointer-events-none"
          style={{ opacity: passLabelOpacity }}
        >
          PASS
        </motion.div>

        {/* ACCEPT label — top-right, reactive to rightward drag */}
        <motion.div
          className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg shadow font-bold text-xs pointer-events-none"
          style={{ opacity: acceptLabelOpacity }}
        >
          ACCEPT
        </motion.div>
      </motion.div>
      
      {/* Action buttons */}
      <div className="sticky bottom-2 left-0 right-0 flex justify-center items-center gap-6 px-6">
        {/* Pass / X button */}
        <motion.button
          type="button"
          onClick={() => handleSwipe(false)}
          disabled={isSwiping}
          className="rounded-full border-2 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: passButtonSize,
            height: passButtonSize,
            backgroundColor: passButtonBg,
            borderColor: passButtonBorder,
            color: passButtonColor,
            scale: passButtonScale,
          }}
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </motion.button>

        <button
          type="button"
          onClick={handleCardClick}
          className="w-14 h-14 rounded-full border-2 border-blue-400 bg-white text-blue-500 transition-all hover:bg-blue-50 hover:border-blue-500 hover:scale-110 flex items-center justify-center shadow-lg"
        >
          <Info className="w-7 h-7" strokeWidth={3} />
        </button>

        {/* Accept / Heart button */}
        <motion.button
          type="button"
          onClick={() => handleSwipe(true)}
          disabled={isSwiping}
          className="rounded-full border-2 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: acceptButtonSize,
            height: acceptButtonSize,
            backgroundColor: acceptButtonBg,
            borderColor: acceptButtonBorder,
            color: acceptButtonColor,
            scale: acceptButtonScale,
          }}
        >
          <Heart className="w-7 h-7" strokeWidth={3} />
        </motion.button>
      </div>

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
