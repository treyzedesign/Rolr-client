import { apiClient } from "./client";
import type { InterviewSession } from "./interviews";

export interface AdminStatsResponse {
  role: string;
  period: string;
  generated_at: string;
  kpis: {
    users: { total: number; this_period: number; pct_change: number };
    jobs: { total: number; active: number; inactive: number; this_period: number; pct_change: number };
    applications: { total: number; this_period: number; pct_change: number };
    matches: { total: number; this_period: number; pct_change: number };
    interviews: { total: number; completed: number; completion_rate: number; this_period: number; pct_change: number };
  };
  breakdowns: {
    users_by_role: Record<string, number>;
    jobs_by_type: Record<string, number>;
    jobs_by_experience: Record<string, number>;
    applications_by_status: Record<string, number>;
    matches_by_status: Record<string, number>;
    interviews_by_status: Record<string, number>;
  };
  time_series: {
    label_format: string;
    users: { date: string; count: number }[];
    jobs: { date: string; count: number }[];
    applications: { date: string; count: number }[];
    matches: { date: string; count: number }[];
    interviews: { date: string; count: number }[];
  };
  top_jobs_by_applications: { count: number; job_id: string; title: string }[];
}

export const getAdminStats = async (period: "7d" | "30d" | "90d" | "12m" = "30d"): Promise<AdminStatsResponse> => {
  const response = await apiClient.get<AdminStatsResponse>("/users/dashboard/admin", {
    params: { period }
  });
  // Since axios returns data inside data.
  // Wait, does the backend return { role: 'admin', period: ... } or { data: { role: 'admin' } }?
  // User provided response data directly: { role: "admin", period: "7d", ... }
  // So response.data is the exact object.
  return response.data;
};

export interface AdminInterviewSessionResponse {
  sessions: InterviewSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getAdminAllInterviews = async (
  status: string = "all",
  page: number = 1,
  limit: number = 20
): Promise<AdminInterviewSessionResponse> => {
  const response = await apiClient.get<AdminInterviewSessionResponse>("/ai-interviews/admin/all", {
    params: { status, page, limit }
  });
  return response.data;
};

export interface AdminApplication {
  _id: string;
  match_id: string | null;
  job_seeker_id: string | {
    _id: string;
    email: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
      bio?: string;
      phone?: string;
      skills?: string[];
      experience_level?: string;
      employment_status?: string;
      location?: string;
    };
  };
  employer_id: string | {
    _id: string;
    email: string;
    profile?: {
      business_name?: string;
      industry?: string;
      profile_image_url?: string;
      bio?: string;
      phone?: string;
      website_url?: string;
    };
  };
  job_id: {
    _id: string;
    title: string;
    description: string;
    location: string;
    job_type: "full_time" | "part_time" | "contract" | "internship";
    experience_level: "entry" | "mid" | "senior";
    salary_min?: number;
    salary_max?: number;
    required_skills?: string[];
  } | string;
  status: "pending" | "submitted" | "matched" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface AdminApplicationsResponse {
  applications: AdminApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getAdminAllApplications = async (
  status: string = "all",
  page: number = 1,
  limit: number = 20
): Promise<AdminApplicationsResponse> => {
  const response = await apiClient.get<AdminApplicationsResponse>("/applications/admin/all", {
    params: { status, page, limit }
  });
  return response.data;
};

export const adminVerifyInterview = async (id: string): Promise<any> => {
  const response = await apiClient.post(`/ai-interviews/admin/${id}/verify`);
  return response.data;
};

export interface AdminBooking {
  _id: string;
  token: string;
  status: "pending" | "booked" | "expired";
  meet_link?: string;
  google_event_id?: string;
  candidate_id?: { _id: string; email: string; first_name?: string; last_name?: string };
  employer_id?: { _id: string; email: string; company_name?: string };
  interview_session_id?: { _id: string; job_id: string; overall_score: number };
  chosen_slot?: { start: string; end: string };
  available_slots: { start: string; end: string; _id: string }[];
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBookingsResponse {
  bookings: AdminBooking[];
}

export const adminGetBookings = async (
  status: string = "all",
  page: number = 1,
  limit: number = 20
): Promise<AdminBookingsResponse> => {
  const response = await apiClient.get<AdminBookingsResponse>("/booking/admin/all", {
    params: { status, page, limit }
  });
  return response.data;
};

export const adminGetBooking = async (id: string): Promise<AdminBooking> => {
  const response = await apiClient.get<AdminBooking>(`/booking/admin/${id}`);
  return response.data;
};

export const adminCancelBooking = async (id: string): Promise<any> => {
  const response = await apiClient.post(`/booking/admin/${id}/cancel`);
  return response.data;
};

export const adminResendBookingLink = async (id: string): Promise<any> => {
  const response = await apiClient.post(`/booking/admin/${id}/resend`);
  return response.data;
};
