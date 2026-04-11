export type UserRole = "job_seeker" | "employer" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  location?: string;
  phone?: string;
  identity?: string;
  jobCategory?: string;
  experienceLevel?: "entry" | "mid" | "senior";
  employmentStatus?: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface JobSeekerRegisterRequest {
  full_name: string;
  email: string;
  password: string;
  location: string;
  phone?: string;
  identity?: string;
  job_category?: string;
  experience_level?: "entry" | "mid" | "senior";
  employment_status?: string;
}
export interface EmployerRegisterRequest {
  email: string;
  password: string;
  business_name: string;
  industry: string;
  phone?: string;
  website_url?: string;
  cac_number?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  expected_hiring_timeline?: "immediate" | "week_1" | "week_2" | "week_4" | "flex";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface ResendOtpResponse {
  message: string;
  email: string;
}
