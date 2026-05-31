"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewSession, InterviewQuestion } from "@/lib/api/interviews";
import { Send, CheckCircle, AlertCircle, Loader2, Mic, MicOff, Square } from "lucide-react";

type RecordingState = "idle" | "recording" | "recorded";

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Find first unanswered question when session loads
  useEffect(() => {
    if (session && session.questions.length > 0) {
      const firstUnansweredIndex = session.questions.findIndex(q =>
        !session.answers?.some(answer => answer.question_index === (q.index - 1))
      );
      setAnsweredCount(session.answers?.length ?? 0);
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
    }
  }, [session]);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Voice recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isLastQuestion = session ? currentQuestionIndex === session.questions.length - 1 : false;

  // Fetch interview session on mount
  useEffect(() => {
    if (!sessionId) {
      setError("No interview session provided");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await interviewsApi.getInterviewSession(sessionId);
        setSession(response.session);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch interview session:", err);
        setError("Failed to load interview session");
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Cleanup audio URL and stream on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      stopStream();
    };
  }, []);

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

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState("recorded");
        stopStream();
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
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

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState("idle");
    setRecordingDuration(0);
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

  const canSubmitAudio = (): boolean => {
    return audioBlob !== null && !isSubmitting;
  };

  const advanceOrComplete = (interviewComplete: boolean, nextIndex: number) => {
    const totalQuestions = session?.questions.length ?? 0;
    setAnsweredCount(prev => prev + 1);
    if (interviewComplete || nextIndex >= totalQuestions) {
      setIsInterviewComplete(true);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer("");
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingState("idle");
      setRecordingDuration(0);
      textareaRef.current?.focus();
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
      advanceOrComplete(!!response.interview_complete, currentQuestionIndex + 1);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAudioAnswer = async () => {
    if (!session || !canSubmitAudio() || !audioBlob) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await interviewsApi.submitAudioAnswer(session._id, audioBlob, currentQuestionIndex);
      advanceOrComplete(!!response.interview_complete, currentQuestionIndex + 1);
    } catch (err) {
      console.error("Failed to submit audio answer:", err);
      setError("Failed to submit audio answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && canSubmitText()) {
      handleSubmitTextAnswer();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    if (!session) return 0;
    return (answeredCount / session.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/candidate/interviews")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-4"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Interview Complete!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for completing the interview. Your responses have been submitted successfully.
            The employer will review your answers and get back to you soon.
          </p>
          <button
            onClick={() => router.push("/candidate/interviews")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Sessions
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No questions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => router.push("/candidate/interviews")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
              >
                ← Back to Sessions
              </button>
              <h1 className="text-2xl font-bold text-slate-900">AI Interview</h1>
              <p className="text-slate-600">{session?.job_id.title}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {answeredCount} of {session?.questions.length} Questions Answered
              </span>
              <span className="text-sm text-slate-500">
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.type === "behavioural"
                    ? "bg-purple-100 text-purple-700"
                    : currentQuestion.type === "situational"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
                </span>
                <span className="text-sm text-slate-500">Question {currentQuestion.index}</span>
                {isLastQuestion && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    Voice Answer
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Section */}
            {isLastQuestion ? (
              <VoiceAnswerSection
                recordingState={recordingState}
                recordingDuration={recordingDuration}
                audioUrl={audioUrl}
                micError={micError}
                isSubmitting={isSubmitting}
                onStart={startRecording}
                onStop={stopRecording}
                onDiscard={discardRecording}
                onSubmit={handleSubmitAudioAnswer}
                canSubmit={canSubmitAudio()}
                formatTime={formatTime}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  ref={textareaRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here... (5-150 words)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                  disabled={isSubmitting}
                />

                <div className="flex items-center justify-between mt-3">
                  <span className={`text-sm ${
                    (getWordCount(currentAnswer) >= 5 && getWordCount(currentAnswer) <= 150)
                      ? "text-green-600"
                      : getWordCount(currentAnswer) > 150
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}>
                    {getWordCount(currentAnswer)} words (5-150 required)
                  </span>

                  <button
                    onClick={handleSubmitTextAnswer}
                    disabled={!canSubmitText()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors ${
                      canSubmitText()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> {currentQuestion.ideal_answer_hint}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Interview Guidelines</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Answer each question thoughtfully and thoroughly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Text questions: 5-150 words required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>The last question requires a voice recording</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Press Ctrl+Enter to submit text answers quickly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface VoiceAnswerSectionProps {
  recordingState: RecordingState;
  recordingDuration: number;
  audioUrl: string | null;
  micError: string | null;
  isSubmitting: boolean;
  onStart: () => void;
  onStop: () => void;
  onDiscard: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  formatTime: (s: number) => string;
}

function VoiceAnswerSection({
  recordingState,
  recordingDuration,
  audioUrl,
  micError,
  isSubmitting,
  onStart,
  onStop,
  onDiscard,
  onSubmit,
  canSubmit,
  formatTime,
}: VoiceAnswerSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-4">
        Your Voice Answer
      </label>

      {micError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <MicOff className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{micError}</p>
        </div>
      )}

      {recordingState === "idle" && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-600 text-sm">Click the button below to start recording your answer</p>
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </button>
        </div>
      )}

      {recordingState === "recording" && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-red-200 bg-red-50 rounded-xl gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Mic className="w-8 h-8 text-red-600" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-red-700 font-medium">Recording...</p>
            <p className="text-red-600 text-sm font-mono mt-1">{formatTime(recordingDuration)}</p>
          </div>
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </button>
        </div>
      )}

      {recordingState === "recorded" && audioUrl && (
        <div className="flex flex-col gap-4 p-6 border border-slate-200 rounded-xl bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Recording complete</p>
              <p className="text-xs text-slate-500">{formatTime(recordingDuration)} recorded</p>
            </div>
          </div>

          <audio controls src={audioUrl} className="w-full h-10" />

          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Re-record
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                canSubmit
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Recording
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
