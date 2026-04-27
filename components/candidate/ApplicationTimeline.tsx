import { Application } from "@/types/job";
import { CheckCircle, Clock, Send, XCircle, Calendar } from "lucide-react";

interface ApplicationTimelineProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationTimeline({ application, isOpen, onClose }: ApplicationTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'reviewing':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'accepted':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'rejected':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'interview_scheduled':
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Send className="w-4 h-4" />;
      case 'reviewing':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Applied';
      case 'reviewing':
        return 'In Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      default:
        return status;
    }
  };

  const timelineSteps = [
    {
      status: 'pending',
      label: 'Application Submitted',
      description: 'Your application has been received',
      completed: true,
      current: application.status === 'pending'
    },
    {
      status: 'reviewing',
      label: 'Under Review',
      description: 'Employer is reviewing your application',
      completed: ['reviewing', 'interview_scheduled', 'accepted', 'rejected'].includes(application.status),
      current: application.status === 'reviewing'
    },
    {
      status: 'interview_scheduled',
      label: 'Interview Stage',
      description: 'Interview scheduled with employer',
      completed: ['interview_scheduled', 'accepted', 'rejected'].includes(application.status),
      current: application.status === 'interview_scheduled'
    },
    {
      status: 'accepted',
      label: 'Final Decision',
      description: application.status === 'accepted' ? 'Congratulations! You got the job' : 'Application processed',
      completed: application.status === 'accepted' || application.status === 'rejected',
      current: application.status === 'accepted' || application.status === 'rejected'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed backdrop-blur-md inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-500 dark:bg-slate-900 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Application Timeline
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {application.job_id.title} at {application.job_id.employer_id?.profile?.business_name || 'Company'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Status */}
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              {getStatusLabel(application.status)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Applied on {new Date(application.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {timelineSteps.map((step, index) => (
              <div key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? application.status === 'rejected' && step.status === 'accepted'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : step.current
                        ? getStatusColor(application.status).replace('border-', 'bg-').replace('text-', 'text-')
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {step.completed ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.current ? (
                      getStatusIcon(application.status)
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-16 mt-2 ${
                      step.completed ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className={`font-medium ${
                    step.completed || step.current 
                      ? 'text-slate-900 dark:text-slate-100' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    step.completed || step.current 
                      ? 'text-slate-600 dark:text-slate-400' 
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {step.description}
                  </p>
                  {step.current && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Current stage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {application.status === 'pending' && (
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
