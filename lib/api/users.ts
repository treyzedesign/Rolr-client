import { apiClient } from "./client";
import { UserRole } from "@/types/auth";
import { CandidateProfile, EmployerProfile } from "@/types/profile";

export interface AdminUser {
  _id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_email_verified: boolean;
  profile: CandidateProfile & EmployerProfile;
}

export interface GetUsersParams {
  role?: string;
  jobCategory?: string;
  experienceLevel?: "entry" | "mid" | "senior";
  employmentStatus?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  const response = await apiClient.get<GetUsersResponse>("/users", { params });
  return response.data;
};

export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.get<AdminUser>(`/users/${id}`);
  return response.data;
};

export interface DashboardStatsResponse {
  role: string;
  stats: {
    jobs: { total: number; active: number; inactive: number };
    applications: { total: number; pending: number; submitted: number; matched: number; approved: number; rejected: number };
    matches: { total: number; active: number };
    interviews: { total: number; completed: number; pending: number; in_progress: number; avg_candidate_score: number | null };
    recent_applications: any[];
  };
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await apiClient.get<DashboardStatsResponse>("/users/dashboard/stats");
  return response.data;
};
