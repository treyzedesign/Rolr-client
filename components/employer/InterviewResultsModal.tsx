"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2 } from "lucide-react";
import type { InterviewSession } from "@/lib/api/interviews";

interface InterviewResultsModalProps {
  session: InterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (session: InterviewSession) => void;
}

export function InterviewResultsModal({ session, isOpen, onClose, onShortlist }: InterviewResultsModalProps) {
  // Clean up audio playback when modal closes
  useEffect(() => {
    if (!isOpen) {
      const audios = document.querySelectorAll("audio");
      audios.forEach((audio) => audio.pause());
    }
  }, [isOpen]);

  if (!session) return null;

  const profile = session.profile_id;
  const isCompleted = session.status === "completed";

  const formatTime = (dateString?: string) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${month} ${day} ${year}, ${hours}:${minutesStr} ${ampm}`;
  };

  const renderTypeBadges = (qIndex: number, type: string) => {
    if (qIndex === 1) {
      return (
        <span className="bg-[#fce4ec] border border-[#f8bbd0] text-[#e91e63] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wide select-none">
          Behavioral
        </span>
      );
    }
    if (qIndex === 2 || qIndex === 3) {
      return (
        <span className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#4caf50] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wide select-none">
          Technical
        </span>
      );
    }
    if (qIndex === 4) {
      return (
        <div className="flex gap-1.5">
          <span className="bg-[#e3f2fd] border border-[#bbdefb] text-[#2979ff] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wide select-none">
            Situational
          </span>
          <span className="bg-[#fce4ec] border border-[#f8bbd0] text-[#e91e63] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wide select-none">
            Behavioral
          </span>
        </div>
      );
    }
    // Fallback
    const colorClass = type === "behavioural" ? "bg-[#fce4ec] border-[#f8bbd0] text-[#e91e63]" :
                       type === "situational" ? "bg-[#e3f2fd] border-[#bbdefb] text-[#2979ff]" :
                       "bg-[#e8f5e9] border-[#c8e6c9] text-[#4caf50]";
    return (
      <span className={`border font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wide select-none ${colorClass}`}>
        {type}
      </span>
    );
  };

  const candName = `${profile?.first_name || "Helen"} ${profile?.last_name || "Coker"}`;
  const candRole = session.job_id?.title || "Virtual Assistant";
  const yearsExperience = profile?.experience_years ? `${profile.experience_years} Years` : "4 Years";
  const locationLabel = profile?.education_level ? "Lagos Nigeria" : "Nigeria"; 

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal Card Centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col select-none"
            >
              
              {/* Close Button top right */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors border-none bg-transparent cursor-pointer z-20"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {/* Scrollable Container */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                
                {/* Profile Header Block */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  {/* Candidate Avatar */}
                  <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                    {profile?.profile_image_url ? (
                      <img 
                        src={profile.profile_image_url} 
                        alt={candName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {candName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Metadata fields */}
                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100">
                        {candName}
                      </h2>
                      {isCompleted && (
                        <span className="bg-white border border-[#4caf50] text-[#4caf50] text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-555 dark:text-slate-400">
                      {candRole} &bull; {locationLabel} &bull; {yearsExperience}
                    </p>
                  </div>
                </div>

                {/* Score & Timeline Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 select-none">
                  {/* Overall Score Capsule */}
                  {session.overall_score !== undefined && (
                    <div className="bg-[#e3f2fd] border border-[#bbdefb]/70 rounded-full px-5 py-2 text-xs font-bold text-slate-500">
                      Overall Score: <span className="text-[#2979ff] font-extrabold">{session.overall_score}/10</span>
                    </div>
                  )}

                  {/* Started / Completed Timeline Capsule */}
                  <div className="bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-full px-5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Started: {formatTime(session.started_at)}</span>
                    <span className="text-slate-400">➔</span>
                    <span>Completed: {formatTime(session.completed_at)}</span>
                  </div>
                </div>

                {/* Questions & Answers Section */}
                <div className="space-y-4 select-none">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Questions & Answers
                  </h3>
                  
                  <div className="space-y-5">
                    {session.questions.map((question) => {
                      const answer = session.answers.find(a => a.question_index === question.index);
                      const isAudio = !!answer?.audio_url;
                      const qIndex = question.index + 1;

                      return (
                        <div 
                          key={question._id} 
                          className="relative pt-6 mt-6 space-y-3"
                        >
                          {/* Curved top-left separator divider line to match mockup exactly */}
                          <div className="absolute top-0 left-0 w-full h-3 border-t-2 border-l-2 border-slate-900 dark:border-slate-700 rounded-tl-xl pointer-events-none" />

                          {/* Question Number & Type Badge Header */}
                          <div className="flex items-center gap-2 flex-wrap pl-3">
                            <span className="text-xs font-bold text-slate-450 dark:text-slate-500">
                              Question {qIndex}
                            </span>
                            {renderTypeBadges(qIndex, question.type)}
                          </div>

                          {/* Robot icon + Question text row */}
                          <div className="flex items-start gap-2.5 pl-3">
                            {/* Blue AI Robot Circle Icon */}
                            <div className="w-6 h-6 rounded-full bg-[#1565c0] border-2 border-blue-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <span className="text-[10px]">🤖</span>
                            </div>
                            <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">
                              {question.text}
                            </p>
                          </div>

                          {/* Answer Container details */}
                          <div className="pl-3">
                            {answer && (
                              isAudio ? (
                                <AudioPlayer 
                                  url={answer.audio_url!} 
                                  submittedAt={formatDateLabel(answer.submitted_at)} 
                                />
                              ) : (
                                /* Standard text response block with overlapping score tag */
                                <div className="bg-[#f0f2f5] dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 relative select-none flex flex-col gap-3 mt-4">
                                  {/* Score pill overlay */}
                                  <div className="absolute -top-3.5 right-6 bg-[#2979ff] text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm z-10">
                                    {answer.score}/10
                                  </div>
                                  
                                  <p className="text-[11px] text-slate-655 dark:text-slate-350 leading-relaxed font-semibold pr-14">
                                    {answer.text}
                                  </p>
                                  
                                  <span className="text-[10px] text-slate-400 font-bold self-end mt-1">
                                    {formatDateLabel(answer.submitted_at)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Summary Section */}
                {session.summary && (
                  <div className="space-y-3 select-none">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      AI Feedback Summary
                    </h3>
                    <div className="bg-[#e3f2fd] border border-[#bbdefb] rounded-2xl p-5 text-xs text-[#1565c0] font-semibold leading-relaxed">
                      {session.summary}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions Row */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 p-6 flex justify-end gap-3 select-none">
                <button
                  onClick={onClose}
                  className="bg-[#f5f5f5] hover:bg-slate-200 text-slate-800 font-bold px-6 py-2.5 rounded-full border-none cursor-pointer transition-colors text-xs"
                >
                  Cancel
                </button>
                {onShortlist && isCompleted && (
                  <button
                    onClick={() => onShortlist(session)}
                    className="bg-[#2979ff] hover:bg-[#2962ff] text-white font-bold px-6 py-2.5 rounded-full border-none cursor-pointer transition-colors text-xs shadow-sm"
                  >
                    Shortlist for Google Meet
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function AudioPlayer({ url, submittedAt }: { url: string; submittedAt: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 relative select-none flex flex-col w-[360px] max-w-full mt-4">

      {/* Audio playback row */}
      <div className="flex items-center gap-3 relative pb-4">
        {/* Play/Pause Button */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-[#2979ff] hover:bg-[#2962ff] text-white flex items-center justify-center transition-all active:scale-90 border-none cursor-pointer shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white text-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          )}
        </button>

        {/* Waveform EQ bars */}
        <div className="flex-1 flex items-end gap-[2px] h-8 pb-1">
          {[...Array(22)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[#2979ff] rounded-full"
              style={{ height: '3px' }}
              animate={{
                height: isPlaying ? `${Math.random() * 18 + 3}px` : '3px',
              }}
              transition={{
                duration: 0.35,
                repeat: isPlaying ? Infinity : 0,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Time duration indicator positioned below right end of waveform */}
        <span className="absolute bottom-0 right-0 text-[9px] text-[#2979ff] font-bold select-none">
          2:22
        </span>
      </div>

      {/* Timestamp at bottom right corner */}
      <span className="text-[10px] text-slate-500 font-bold self-end mt-1 select-none">
        {submittedAt}
      </span>

      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}
