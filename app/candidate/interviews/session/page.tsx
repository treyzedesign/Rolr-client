"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewSession, InterviewQuestion } from "@/lib/api/interviews";
import { Clock, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Find first unanswered question when session loads
  useEffect(() => {
    if (session && session.questions.length > 0) {
      const firstUnansweredIndex = session.questions.findIndex(q => 
        !session.answers?.some(answer => answer.question_index === (q.index - 1))
      );
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
    }
  }, [session]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        
        // Start timer for first question
        startTimer();
      } catch (err) {
        console.error("Failed to fetch interview session:", err);
        setError("Failed to load interview session");
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isInterviewComplete) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isInterviewComplete) {
      // Auto-submit when time runs out
      handleSubmitAnswer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isInterviewComplete]);

  const startTimer = () => {
    setTimeLeft(120);
  };

  const getCurrentQuestion = (): InterviewQuestion | null => {
    if (!session || currentQuestionIndex >= session.questions.length) {
      return null;
    }
    return session.questions[currentQuestionIndex];
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const canSubmit = (): boolean => {
    const wordCount = getWordCount(currentAnswer);
    return wordCount >= 5 && wordCount <= 150 && !isSubmitting && timeLeft > 0;
  };

  const handleSubmitAnswer = async () => {
    if (!session || !canSubmit()) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await interviewsApi.submitAnswer(session._id, {
        question_index: currentQuestionIndex,
        text: currentAnswer
      });

      if (response.interview_complete) {
        setIsInterviewComplete(true);
      } else {
        // Check if this was the last question as fallback
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex >= session.questions.length) {
          setIsInterviewComplete(true);
        } else {
          // Move to next question
          setCurrentQuestionIndex(nextQuestionIndex);
          setCurrentAnswer("");
          startTimer();
          textareaRef.current?.focus();
        }
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && canSubmit()) {
      handleSubmitAnswer();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!session) return 0;
    const answeredCount = session.answers?.length || 0;
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
            onClick={() => router.push('/candidate/interviews')}
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
          <div className="space-y-4">
            <button
              onClick={() => router.push('/candidate/interviews')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Sessions
            </button>
          </div>
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
                onClick={() => router.push('/candidate/interviews')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
              >
                ← Back to Sessions
              </button>
              <h1 className="text-2xl font-bold text-slate-900">AI Interview</h1>
              <p className="text-slate-600">{session?.job_id.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {session?.answers?.length || 0} of {session?.questions.length} Questions Answered
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
                  currentQuestion.type === 'behavioural' 
                    ? 'bg-purple-100 text-purple-700'
                    : currentQuestion.type === 'situational'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
                </span>
                <span className="text-sm text-slate-500">Question {currentQuestion.index}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Answer
              </label>
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={handleAnswerChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here... (5-150 words)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                disabled={isSubmitting || timeLeft === 0}
              />
              
              <div className="flex items-center justify-between mt-3">
                <span className={`text-sm ${
                  (getWordCount(currentAnswer) >= 5 && getWordCount(currentAnswer) <= 150) ? 'text-green-600' : 
                  getWordCount(currentAnswer) > 150 ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {getWordCount(currentAnswer)} words (5-150 required)
                </span>
                
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!canSubmit()}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors ${
                    canSubmit()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> {currentQuestion.ideal_answer_hint}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

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
              <span>5-150 words required for each answer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You have 2 minutes per question</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Press Ctrl+Enter to submit your answer quickly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
