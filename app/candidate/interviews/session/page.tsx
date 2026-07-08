"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewSession, InterviewQuestion } from "@/lib/api/interviews";
import { Send, CheckCircle, AlertCircle, Loader2, Mic, MicOff, Square, Bell, ArrowLeft, X, Check } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";

type RecordingState = "idle" | "recording" | "recorded";

const WAVEFORM_HEIGHTS = [
  6, 8, 10, 8, 12, 16, 12, 8, 10, 14, 
  20, 26, 18, 12, 14, 18, 22, 16, 10, 8,
  12, 18, 24, 30, 24, 18, 12, 14, 20, 24,
  18, 12, 10, 12, 16, 22, 18, 14, 10, 8,
  6, 8, 12, 10, 8, 6
];

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const { user } = useAuthStore();
  const { fetchProfile, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Flow previews states
  const [submittedAnswerText, setSubmittedAnswerText] = useState<string | null>(null);
  const [submittedAudioUrl, setSubmittedAudioUrl] = useState<string | null>(null);
  const [submittedAudioDuration, setSubmittedAudioDuration] = useState<number>(0);
  const [apiResponseCompletion, setApiResponseCompletion] = useState<boolean>(false);

  // Voice recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Audio Playback states for recorded audio preview
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const shouldSubmitOnStopRef = useRef<boolean>(false);

  const isLastQuestion = session ? currentQuestionIndex === session.questions.length - 1 : false;

  // Fetch interview session and profile on mount
  useEffect(() => {
    fetchProfile();

    if (!sessionId) {
      setError("No interview session provided");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await interviewsApi.getInterviewSession(sessionId);
        setSession(response.session);

        // Find first unanswered question
        if (response.session) {
          if (response.session.status === "completed") {
            setIsInterviewComplete(true);
          } else if (response.session.questions.length > 0) {
            const firstUnansweredIndex = response.session.questions.findIndex(q =>
              !response.session.answers?.some(answer => answer.question_index === q.index)
            );
            const answered = response.session.answers?.length ?? 0;
            setAnsweredCount(answered);

            if (firstUnansweredIndex !== -1) {
              setCurrentQuestionIndex(firstUnansweredIndex);
              // If already answered some questions, skip welcome screen
              if (answered > 0) {
                setIsStarted(true);
              }
            } else {
              setIsInterviewComplete(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch interview session:", err);
        setError("Failed to load interview session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, fetchProfile]);

  // Cleanup audio URL, audio tags, and stream on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      stopStream();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, [audioUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg;codecs=opus";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState("recorded");
        stopStream();
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        if (shouldSubmitOnStopRef.current) {
          shouldSubmitOnStopRef.current = false;
          setIsSubmitting(true);
          try {
            const response = await interviewsApi.submitAudioAnswer(session!._id, blob, currentQuestionIndex);
            setSubmittedAudioUrl(url);
            setSubmittedAudioDuration(recordingDuration || 3);
            setApiResponseCompletion(!!response.interview_complete);
          } catch (err) {
            console.error("Failed to submit audio answer:", err);
            setError("Failed to submit audio answer. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      recorder.start(250);
      setRecordingState("recording");
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicError("Microphone access denied. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const stopAndSubmitRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      shouldSubmitOnStopRef.current = true;
      mediaRecorderRef.current.stop();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else if (audioBlob) {
      handleSubmitAudioAnswer();
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState("idle");
    setRecordingDuration(0);
    setIsPlayingAudio(false);
    shouldSubmitOnStopRef.current = false;
  };

  const handleAudioPlayPause = () => {
    const targetUrl = submittedAudioUrl || audioUrl;
    if (!targetUrl) return;

    if (!previewAudioRef.current || previewAudioRef.current.src !== targetUrl) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      const audio = new Audio(targetUrl);
      previewAudioRef.current = audio;

      audio.addEventListener("play", () => setIsPlayingAudio(true));
      audio.addEventListener("pause", () => setIsPlayingAudio(false));
      audio.addEventListener("ended", () => {
        setIsPlayingAudio(false);
        setAudioCurrentTime(0);
      });
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        setAudioCurrentTime(audio.currentTime);
      });
    }

    if (isPlayingAudio) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play();
    }
  };

  const getCurrentQuestion = (): InterviewQuestion | null => {
    if (!session || currentQuestionIndex >= session.questions.length) return null;
    return session.questions[currentQuestionIndex];
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const canSubmitText = (): boolean => {
    const wordCount = getWordCount(currentAnswer);
    return wordCount >= 5 && wordCount <= 150 && !isSubmitting;
  };

  const handleNextQuestion = () => {
    const totalQuestions = session?.questions.length ?? 0;
    setAnsweredCount(prev => prev + 1);

    const nextIndex = currentQuestionIndex + 1;
    if (apiResponseCompletion || nextIndex >= totalQuestions) {
      setIsInterviewComplete(true);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer("");
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingState("idle");
      setRecordingDuration(0);
      setIsPlayingAudio(false);
      setSubmittedAnswerText(null);
      setSubmittedAudioUrl(null);
      setSubmittedAudioDuration(0);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleSubmitTextAnswer = async () => {
    if (!session || !canSubmitText()) return;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await interviewsApi.submitAnswer(session._id, {
        question_index: currentQuestionIndex,
        text: currentAnswer,
      });
      setSubmittedAnswerText(currentAnswer);
      setApiResponseCompletion(!!response.interview_complete);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAudioAnswer = async () => {
    if (!session || !audioBlob) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await interviewsApi.submitAudioAnswer(session._id, audioBlob, currentQuestionIndex);
      setSubmittedAudioUrl(audioUrl);
      setSubmittedAudioDuration(recordingDuration);
      setApiResponseCompletion(!!response.interview_complete);
    } catch (err) {
      console.error("Failed to submit audio answer:", err);
      setError("Failed to submit audio answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmitText()) {
        handleSubmitTextAnswer();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 65) % 60;
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Jetty Connor";

  const emailDisplay = user?.email || "candidate@example.com";

  if (loading) {
    return (
      <div className="space-y-6 pb-12 flex flex-col min-h-full">
        {/* Page Header */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/candidate/interviews")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer font-bold text-xs">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Interview
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-655 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {candidateProfile?.profile_image_url ? (
                  <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  candidateName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-550 dark:text-slate-400 font-medium">Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex-1 flex flex-col justify-center items-center pt-32 text-center select-none">
          <div className="relative flex items-center justify-center w-12 h-12 mb-6">
            <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-400">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-[500px] flex flex-col justify-center items-center text-center p-8 select-none">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/candidate/interviews")}
          className="px-6 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all border-none cursor-pointer"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="space-y-6 pb-12 flex flex-col min-h-full">
        {/* Page Header */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/candidate/interviews")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer font-bold text-xs">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Interview
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-655 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {candidateProfile?.profile_image_url ? (
                  <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  candidateName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-550 dark:text-slate-400 font-medium">Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion card wrapper */}
        <div className="flex-1 flex justify-center items-center pt-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-full max-w-xl text-center select-none min-h-[580px] flex flex-col justify-center items-center">
            {/* Sleek Bot Icon */}
            <div className="mb-6 relative w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <img src="/Assets/bot_pic.png" alt="AI Assistant" className="w-16 h-16 rounded-full object-cover shadow-sm" />
            </div>

            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-normal mb-6">
              Interview Completed Successfully 🎉
            </h2>

            <div className="text-slate-655 dark:text-slate-400 text-xs md:text-sm font-medium space-y-4 max-w-md mx-auto text-center leading-relaxed">
              <p>Thank you for completing your interview assessment.</p>
              <p>Your responses, including your voice recording and test answers, have been submitted successfully and are now being reviewed by our team.</p>
              <p>If your profile matches our requirements, we'll contact you regarding the next stage of the recruitment process.</p>
              <p className="pt-2 text-slate-450 dark:text-slate-500">
                We appreciate the time and effort you invested in this assessment. We wish you the best of luck!
              </p>
            </div>

            <button
              onClick={() => router.push("/candidate/discover")}
              className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-all border-none cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-sm hover:scale-102 active:scale-95 min-w-[160px]"
            >
              Discover Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return (
      <div className="min-h-[500px] flex flex-col justify-center items-center text-center p-8 select-none">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-sm font-semibold text-slate-500">No questions available</p>
      </div>
    );
  }

  // 1. Welcome Onboarding screen before starting
  if (!isStarted) {
    return (
      <div className="space-y-6 pb-12 flex flex-col min-h-full">
        {/* Header toolbar */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/candidate/interviews")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer font-bold text-xs">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Interview
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-655 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {candidateProfile?.profile_image_url ? (
                  <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  candidateName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal card wrapper */}
        <div className="flex-1 flex justify-center items-center pt-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-full max-w-xl text-center select-none min-h-[580px] flex flex-col justify-center items-center">
            {/* Sleek Bot Icon */}
            <div className="mb-6 relative w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <img src="/Assets/bot_pic.png" alt="AI Assistant" className="w-16 h-16 rounded-full object-cover shadow-sm" />
            </div>

            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-normal max-w-sm mx-auto mb-6">
              Welcome! {candidateName} you're about to begin your interview assessment.
            </h2>

            <div className="text-slate-555 dark:text-slate-400 text-xs md:text-sm font-medium space-y-4 max-w-sm mx-auto text-left leading-relaxed">
              <p>This assessment consists of:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Test-based questions to evaluate your skills and knowledge</li>
                <li>A voice response question where you'll test your microphone and record a short answer.</li>
              </ol>
              <p className="pt-2 text-slate-400">
                Please ensure you're in a quiet environment and that your microphone is working properly before you begin.
              </p>
              <p className="text-center font-semibold pt-4 text-slate-700 dark:text-slate-350">
                Click Continue to start the interview
              </p>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all border-none cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-sm hover:scale-102 active:scale-95"
            >
              Continue
              <span className="text-sm font-light mt-[-2px]">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we are previewing the answer that was just submitted
  const isPreviewingAnswer = submittedAnswerText !== null || submittedAudioUrl !== null;

  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Active Session Header toolbar */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/candidate/interviews")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer font-bold text-xs">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            Back to Interview
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-655 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {candidateProfile?.profile_image_url ? (
                <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                candidateName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Candidate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main card panel */}
      <div className="flex-1 flex justify-center items-start pt-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-full max-w-2xl flex flex-col justify-start min-h-[580px]">

          {/* Conversational Layout Container */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Chat Conversation Stream */}
            <div className="space-y-6">
              {/* AI Agent Question bubble */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-sm border border-slate-100 dark:border-slate-800 select-none">
                  <img src="/Assets/bot_pic.png" alt="AI Agent" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div className="bg-slate-50 border border-slate-100/70 rounded-3xl p-6 text-sm text-slate-850 dark:bg-slate-950/20 dark:border-slate-800/80 dark:text-slate-200 leading-relaxed flex-1 max-w-xl">
                  <p className="font-semibold">{currentQuestion.text}</p>
                </div>
              </div>

              {/* User Answer Preview Bubble (Phase 2: Previewing submitted answer, right aligned) */}
              {isPreviewingAnswer && (
                <>
                  {submittedAnswerText !== null ? (
                    /* Text Preview bubble matching Mockup Image 6 */
                    <div className="flex items-start justify-end space-x-4 mt-6">
                      <div className="bg-blue-600 rounded-3xl p-5 text-sm text-white leading-relaxed flex-1 max-w-xl relative">
                        <p className="font-medium pr-10">{submittedAnswerText}</p>
                        <span className="text-[9px] font-bold text-blue-200 block text-right mt-2 select-none">
                          2:30 PM
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-blue-100 text-sm font-bold text-blue-700 border border-slate-100 flex items-center justify-center select-none">
                        {candidateProfile?.profile_image_url ? (
                          <img src={candidateProfile.profile_image_url} alt="candidate" className="w-full h-full object-cover" />
                        ) : (
                          candidateName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Voice Preview bubble matching Mockup Image 9 */
                    <div className="flex items-start justify-end space-x-4 mt-6">
                      <div className="bg-blue-600 rounded-[2rem] p-4 pr-12 pb-6 flex items-center gap-3 w-full max-w-sm shadow-sm relative">
                        <button
                          onClick={handleAudioPlayPause}
                          className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer border-none shadow-sm"
                        >
                          {isPlayingAudio ? (
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                          ) : (
                            <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>

                        {/* Audio Progress Waveform inside blue bubble */}
                        <div className="flex-1 h-8 flex items-center gap-[2.5px] select-none px-2 overflow-hidden">
                          {WAVEFORM_HEIGHTS.map((height, i) => {
                            const progress = audioDuration ? (audioCurrentTime / audioDuration) : 0;
                            const isPlayed = (i / WAVEFORM_HEIGHTS.length) < progress;
                            return (
                              <div
                                key={i}
                                className={`w-[2px] rounded-full transition-all duration-300 ${
                                  isPlayed ? "bg-white" : "bg-white/40"
                                }`}
                                style={{ height: `${height * 0.6}px` }}
                              />
                            );
                          })}
                        </div>

                        <span className="absolute bottom-2 right-4 text-[10px] font-bold text-blue-200 select-none font-mono">
                          {isPlayingAudio ? formatTime(audioCurrentTime) : formatTimeRemaining(submittedAudioDuration) || "0:03"}
                        </span>
                      </div>

                      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-blue-100 text-sm font-bold text-blue-700 border border-slate-100 flex items-center justify-center select-none">
                        {candidateProfile?.profile_image_url ? (
                          <img src={candidateProfile.profile_image_url} alt="candidate" className="w-full h-full object-cover" />
                        ) : (
                          candidateName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Interaction Controls Area (Answering state vs. Previewing state) */}
            <div className="mt-8">
              {isPreviewingAnswer ? (
                /* Next Step / Final submit button */
                <div className="flex justify-center pt-8 select-none">
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:scale-102 active:scale-95 min-w-[160px]"
                  >
                    {isLastQuestion ? (
                      "Submit Interview"
                    ) : (
                      <>
                        Next
                        <span className="text-sm font-light mt-[-2px]">&rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              ) : isLastQuestion ? (
                /* A. VOICE RECORDING WORKSPACE (Phase 1: Recording) */
                <div className="space-y-4">
                  {micError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                      <MicOff className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-xs text-red-750 font-bold">{micError}</p>
                    </div>
                  )}

                  {recordingState === "idle" && (
                    /* Voice recording idle box matching Mockup Image 7 */
                    <div className="bg-slate-50 dark:bg-slate-950/20 rounded-3xl p-6 flex items-center justify-center min-h-[100px] select-none border border-slate-100/50 dark:border-slate-800/40">
                      <button
                        onClick={startRecording}
                        disabled={isSubmitting}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                      >
                        <Mic className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}

                  {recordingState === "recording" && (
                    /* Voice recording active workspace matching mockup 1 */
                    <div className="flex flex-col items-center justify-center gap-6 py-6 px-6 bg-slate-50 dark:bg-slate-950/20 rounded-3xl w-full relative select-none border border-slate-100/50 dark:border-slate-800/40">
                      {/* Timer & sound waves row */}
                      <div className="flex items-center justify-center gap-4 w-full max-w-md">
                        <span className="text-sm font-medium text-slate-655 dark:text-slate-400 font-mono select-none shrink-0">
                          {formatTime(recordingDuration)}
                        </span>

                        {/* Sound Wave bars animation */}
                        <div className="flex-1 h-12 flex items-center justify-center gap-[2px] select-none overflow-hidden">
                          {WAVEFORM_HEIGHTS.map((height, i) => (
                            <div
                              key={i}
                              className="w-[2px] rounded-full bg-blue-400/90 animate-pulse"
                              style={{
                                height: `${height}px`,
                                animationDelay: `${i * 30}ms`,
                                animationDuration: "1s"
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Discard, Stop, Submit Actions bar */}
                      <div className="flex items-center justify-center gap-10 w-full">
                        <button
                          onClick={discardRecording}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-900 dark:text-slate-100 transition-all border-none cursor-pointer"
                          title="Discard"
                        >
                          <X className="w-5 h-5 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={stopRecording}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md active:scale-95 transition-all border-none cursor-pointer"
                          title="Stop"
                        >
                          <Square className="w-4 h-4 fill-white text-white" />
                        </button>

                        <button
                          onClick={stopAndSubmitRecording}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-900 dark:text-slate-100 transition-all border-none cursor-pointer"
                          title="Submit"
                        >
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {recordingState === "recorded" && (
                    isSubmitting ? (
                      /* Recorded submission loader state */
                      <div className="bg-slate-50 dark:bg-slate-950/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 min-h-[140px] select-none border border-slate-100/50 dark:border-slate-800/40">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Processing Audio answer...</p>
                      </div>
                    ) : (
                      /* Recorded audio preview before submission matching mockup 2 & 3 */
                      <div className="flex flex-col items-center justify-center gap-6 py-6 px-6 bg-slate-50 dark:bg-slate-950/20 rounded-3xl w-full relative select-none border border-slate-100/50 dark:border-slate-800/40">
                        {/* Audio player preview row */}
                        <div className="flex items-center justify-center gap-4 w-full max-w-md">
                          <span className="text-sm font-medium text-slate-655 dark:text-slate-400 font-mono select-none shrink-0">
                            {formatTime(recordingDuration)}
                          </span>

                          {/* Progress waveform */}
                          <div className="flex-1 h-12 flex items-center justify-center gap-[2px] select-none overflow-hidden">
                            {WAVEFORM_HEIGHTS.map((height, i) => {
                              const progress = audioDuration ? (audioCurrentTime / audioDuration) : 0;
                              const isPlayed = (i / WAVEFORM_HEIGHTS.length) < progress;
                              return (
                                <div
                                  key={i}
                                  className={`w-[2px] rounded-full transition-all duration-200 ${
                                    isPlayed ? "bg-blue-600" : "bg-blue-300"
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Discard / Play-Pause / Submit Actions bar */}
                        <div className="flex items-center justify-center gap-10 w-full">
                          <button
                            onClick={discardRecording}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-900 dark:text-slate-100 transition-all border-none cursor-pointer"
                            title="Discard"
                          >
                            <X className="w-5 h-5 stroke-[2.5]" />
                          </button>

                          <button
                            onClick={handleAudioPlayPause}
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md active:scale-95 transition-all border-none cursor-pointer"
                            title={isPlayingAudio ? "Pause" : "Play"}
                          >
                            {isPlayingAudio ? (
                              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 fill-current text-white ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>

                          <button
                            onClick={handleSubmitAudioAnswer}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-900 dark:text-slate-100 transition-all border-none cursor-pointer"
                            title="Submit Answer"
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* B. TEXT INPUT WORKSPACE (Phase 1: Answering) */
                <div className="relative mt-8">
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type here....."
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-slate-50 border-none p-4 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-28 dark:bg-slate-950 dark:text-slate-100 leading-relaxed"
                  />
                  <button
                    onClick={handleSubmitTextAnswer}
                    disabled={!canSubmitText()}
                    className="absolute bottom-3.5 right-3.5 p-2 bg-transparent hover:bg-slate-200/50 rounded-full transition-colors border-none cursor-pointer text-blue-650 disabled:text-slate-300 dark:disabled:text-slate-750"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Error banner message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2 max-w-xl select-none mx-auto">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-750 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
