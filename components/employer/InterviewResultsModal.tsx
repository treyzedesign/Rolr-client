"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle, AlertCircle, TrendingUp, User, FileText, Calendar } from "lucide-react";
import type { InterviewSession } from "@/lib/api/interviews";

interface InterviewResultsModalProps {
  session: InterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewResultsModal({ session, isOpen, onClose }: InterviewResultsModalProps) {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Results</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">
                          {session.profile_id.first_name} {session.profile_id.last_name}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="capitalize">{session.status.replace('_', ' ')}</span>
                      </div>
                      {session.overall_score && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(session.overall_score)}`}>
                          <TrendingUp className="w-4 h-4" />
                          <span>{session.overall_score}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Candidate Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Candidate Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Education</span>
                      </div>
                      <p className="text-slate-900">{session.profile_id.education_level}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Experience</span>
                      </div>
                      <p className="text-slate-900">{session.profile_id.experience_years} years</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.profile_id.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interview Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Interview Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Started</p>
                        <p className="text-slate-600">{session.started_at ? formatDate(session.started_at) : 'Not started'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Completed</p>
                        <p className="text-slate-600">{session.completed_at ? formatDate(session.completed_at) : 'Not completed'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions & Answers */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Questions & Answers</h3>
                  <div className="space-y-4">
                    {session.questions.map((question, index) => {
                      const answer = session.answers.find(a => a.question_index === question.index - 1);
                      return (
                        <div key={question._id} className="border border-slate-200 rounded-lg p-4">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-slate-500">Question {question.index}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.type === 'behavioural' 
                                  ? 'bg-purple-100 text-purple-700'
                                  : question.type === 'situational'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                              </span>
                            </div>
                            <p className="font-medium text-slate-900">{question.text}</p>
                          </div>
                          
                          {answer && (
                            <div className="ml-4 border-l-4 border-blue-200 pl-4">
                              <div className="mb-2">
                                <p className="text-slate-700 mb-2">{answer.text}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className={`flex items-center gap-1 font-medium ${getScoreColor(answer.score)}`}>
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{answer.score}/10</span>
                                  </div>
                                  <span className="text-slate-500">
                                    {formatDate(answer.submitted_at)}
                                  </span>
                                </div>
                              </div>
                              {answer.feedback && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <p className="text-sm text-amber-800">
                                    <strong>Feedback:</strong> {answer.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                {session.summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Interview Summary</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{session.summary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    {session.job_id.title} • {formatDate(session.created_at)}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Shortlist Candidate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
