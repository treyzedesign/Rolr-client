import { apiClient } from './client';

export interface InterviewQuestion {
  index: number;
  text: string;
  type: "behavioural" | "situational" | "technical";
  ideal_answer_hint: string;
  _id: string;
}

export interface InterviewSession {
  _id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  job_id: {
    _id: string;
    title: string;
    description: string;
  };
  profile_id: {
    _id: string;
    first_name: string;
    last_name: string;
    education_level: string;
    experience_years: number;
    skills: string[];
  };
  status: "pending" | "in_progress" | "completed" | "expired";
  expires_at: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  questions: InterviewQuestion[];
  answers: Array<{
    question_index: number;
    text: string;
    score: number;
    feedback: string;
    submitted_at: string;
    _id: string;
  }>;
  overall_score?: number;
  summary?: string;
}

export interface InterviewSessionResponse {
  session: InterviewSession;
}

export interface AnswerSubmission {
  question_index: number;
  text: string;
}

export interface AnswerResponse {
  message: string;
  answer: {
    question_index: number;
    text: string;
    submitted_at: string;
  };
  next_question?: InterviewQuestion;
  interview_complete?: boolean;
}

export interface CandidateInterviewSession {
  _id: string;
  candidate_id: string;
  employer_id: string;
  match_id: string;
  status: "pending" | "in_progress" | "completed" | "expired";
  created_at: string;
  updated_at: string;
  expires_at: string;
  job_id: {
    _id: string;
    title: string;
    description: string;
  };
  answers: Array<{
    question_index: number;
    text: string;
    submitted_at: string;
  }>;
  questions: InterviewQuestion[];
}

export interface CandidateSessionsResponse {
  sessions: CandidateInterviewSession[];
}

export interface CandidateSessionResponse {
  session: CandidateInterviewSession;
}

export interface EmployerSessionsResponse {
  sessions: InterviewSession[];
}

export const interviewsApi = {
  // Get interview session details
  getInterviewSession: async (id: string): Promise<InterviewSessionResponse> => {
    const response = await apiClient.get(`/ai-interviews/${id}`);
    return response.data;
  },

  // Get candidate interview session details (includes answers)
  getCandidateInterviewSession: async (id: string): Promise<CandidateSessionResponse> => {
    const response = await apiClient.get(`/ai-interviews/${id}/candidate`);
    return response.data;
  },

  // Submit answer to a question
  submitAnswer: async (id: string, answer: AnswerSubmission): Promise<AnswerResponse> => {
    const response = await apiClient.post(`/ai-interviews/${id}/answer`, answer);
    return response.data;
  },

  // Get interview results (employer only)
  getInterviewResults: async (id: string) => {
    const response = await apiClient.get(`/ai-interviews/${id}/results`);
    return response.data;
  },

  // Get all interview sessions for employer
  getEmployerSessions: async (): Promise<EmployerSessionsResponse> => {
    const response = await apiClient.get('/ai-interviews/employer/sessions');
    return response.data;
  },

  // Get candidate's interview sessions
  getCandidateSessions: async (): Promise<CandidateSessionsResponse> => {
    const response = await apiClient.get('/ai-interviews/candidate/sessions');
    return response.data;
  }
};
