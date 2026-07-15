"use client";

import { motion } from "framer-motion";
import { X, Volume2, Play, Pause, MapPin, Briefcase } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { JobApplicant } from "@/types/job";

interface ApplicantProfileModalProps {
  applicant: JobApplicant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicantProfileModal({ applicant, isOpen, onClose }: ApplicantProfileModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const profile = applicant?.job_seeker_id?.profile;

  const togglePlayPause = () => {
    if (!audioRef.current || !profile?.voice_intro_url) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  // Cleanup audio when modal closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Cleanup audio when applicant changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [applicant]);

  if (!isOpen || !applicant || !profile) return null;

  const applicantName = `${profile.first_name || "Helen"} ${profile.last_name || "Coker"}`;
  const applicantRole = applicant.job_id?.title || profile.job_category || "Virtual Assistant";
  const experienceYears = profile.experience_years ? `${profile.experience_years} Years` : "Not specified";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Backdrop blur overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col select-none"
      >
        
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors border-none bg-transparent cursor-pointer z-20"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Modal Content Scroll Area */}
        <div className="p-8 space-y-6">
          
          {/* Header Profile Area */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            {/* Circular Profile Avatar */}
            <div className="w-24 h-24 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-150 overflow-hidden shadow-xs shrink-0">
              {profile?.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt={applicantName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {applicantName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Candidate Details */}
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100">
                {applicantName}
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>{applicantRole}</span>
                {profile.location && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
                    </span>
                  </>
                )}
                {profile.experience_years !== undefined && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {experienceYears}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Biography/About Description */}
          {profile.bio && (
            <div className="text-sm font-semibold text-slate-655 dark:text-slate-350 leading-relaxed max-w-xl">
              {profile.bio}
            </div>
          )}

          {/* Core Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Education Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-3.5">
                  Education
                </h3>
                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[110px] shrink-0">Education Level:</span>
                    <span className="text-slate-700 dark:text-slate-300">{profile.education_level || "Not specified"}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[110px] shrink-0">Field of Study:</span>
                    <span className="text-slate-700 dark:text-slate-300">{profile.education_field || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Job Preference Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-3.5">
                  Job Preference
                </h3>
                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0">Min Salary:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {profile.preferred_salary_min ? `NGN ${profile.preferred_salary_min.toLocaleString()}` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0">Max Salary:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {profile.preferred_salary_max ? `NGN ${profile.preferred_salary_max.toLocaleString()}` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0">Work Type Preference:</span>
                    <span className="text-slate-700 dark:text-slate-300 capitalize">{profile.work_type_preference || "Not specified"}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0">Availability:</span>
                    <span className="text-slate-700 dark:text-slate-300 capitalize">{profile.availability || "Not specified"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Voice Introduction Card */}
              {profile.voice_intro_url && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-3.5">
                    Voice Introduction
                  </h3>
                  
                  {/* Wave player wrapper */}
                  <div className="bg-blue-50/50 dark:bg-blue-955/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-90 border-none cursor-pointer shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 select-none">
                        <Volume2 className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Voice Intro Playback</span>
                      </div>
                      {/* Interactive graphic EQ wave indicator */}
                      <div className="flex items-end gap-1.5 h-4 pb-0.5">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-blue-400 dark:bg-blue-500/80 rounded-full"
                            style={{ height: '3px' }}
                            animate={{
                              height: isPlaying ? `${Math.random() * 12 + 3}px` : '3px',
                            }}
                            transition={{
                              duration: 0.35,
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

              {/* Professional Information Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-3.5">
                  Professional Information
                </h3>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[120px] shrink-0">Job Category:</span>
                    <span className="text-slate-700 dark:text-slate-300">{profile.job_category || "Not specified"}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[120px] shrink-0">Experience Level:</span>
                    <span className="text-slate-700 dark:text-slate-300 capitalize">{profile.experience_level || "Not specified"}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[120px] shrink-0">Years of Experience:</span>
                    <span className="text-slate-700 dark:text-slate-300">{experienceYears}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 dark:text-slate-500 min-w-[120px] shrink-0">Employment Status:</span>
                    <span className="text-slate-700 dark:text-slate-300">{profile.employment_status || "Not specified"}</span>
                  </div>
                  {profile.work_experience && (
                    <div className="flex flex-col gap-1 border-t border-slate-50 dark:border-slate-850/50 pt-2.5">
                      <span className="text-slate-400 dark:text-slate-500">Work Experience:</span>
                      <span className="text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">{profile.work_experience}</span>
                    </div>
                  )}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-850/50 pt-2.5">
                      <span className="text-slate-400 dark:text-slate-500">Skills:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{profile.skills.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Hidden Audio Player for playback */}
        {profile.voice_intro_url && (
          <audio
            ref={audioRef}
            src={profile.voice_intro_url}
            onEnded={handleAudioEnd}
            preload="metadata"
          />
        )}

      </motion.div>
    </div>
  );
}
