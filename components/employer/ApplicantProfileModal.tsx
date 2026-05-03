"use client";

import { motion } from "framer-motion";
import { X, MapPin, Briefcase, GraduationCap, Volume2, Play, Pause, User } from "lucide-react";
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

  const profile = applicant?.job_seeker_id.profile;

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

  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header with background image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600">
          {profile?.profile_image_url && (
            <img
              src={profile.profile_image_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Profile name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-3xl font-bold text-white mb-1">
              {profile?.first_name} {profile?.last_name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Basic Information</h3>
            <div className="space-y-3">
              {profile?.bio && (
                  <div className="flex items-start text-slate-600">
                    <User className="w-4 h-4 mr-3 text-slate-400 mt-0.5" />
                    <span className="text-slate-700 leading-relaxed">{profile.bio}</span>
                  </div>
              )}
              {profile?.location && (
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>



          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Professional Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Professional Information</h3>
            <div className="space-y-3">
              {profile?.experience_level && (
                <div className="flex items-center text-slate-600">
                  <Briefcase className="w-4 h-4 mr-3 text-slate-400" />
                  <span>Experience Level: {profile.experience_level}</span>
                </div>
              )}
              {profile?.job_category && (
                <div className="flex items-center text-slate-600">
                  <GraduationCap className="w-4 h-4 mr-3 text-slate-400" />
                  <span>Category: {profile.job_category}</span>
                </div>
              )}
              {profile?.employment_status && (
                <div className="flex items-center text-slate-600">
                  <Briefcase className="w-4 h-4 mr-3 text-slate-400" />
                  <span>Employment Status: {profile.employment_status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Voice Introduction */}
          {profile?.voice_intro_url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Voice Introduction</h3>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Voice Introduction</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      {isPlaying ? "Playing..." : "Click to play voice introduction"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Application Details</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Applied Position:</span>
                  <span className="text-sm font-medium text-slate-900">{applicant.job_id.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Application Status:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    applicant.status === 'approved' ? 'bg-green-100 text-green-700' :
                    applicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {applicant.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Applied Date:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(applicant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {profile?.voice_intro_url && (
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
