export interface CandidateProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string;
  identity?: string;
  job_category?: string;
  experience_level?: "entry" | "mid" | "senior";
  employment_status?: string;
  work_experience?: string;
  education_level?: string;
  education_field?: string;
  skills?: string[];
  experience_years?: number;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  work_type_preference?: string;
  availability?: string;
  resume_url?: string;
  resume?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  certifications?: string[];
  references_available?: boolean;
  video_intro_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployerProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string;
  company?: string;
  industry?: string;
  skills?: string[];
  business_name?: string;
  cac_number?: string;
  website_url?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  expected_hiring_timeline?: "immediate" | "week_1" | "week_2" | "week_4" | "flex";
  created_at?: string;
  updated_at?: string;
}

export interface ProfileResponse {
  message: string;
  profile: CandidateProfile | EmployerProfile;
}

export interface ProfileUpdateRequest extends Partial<CandidateProfile> {}

// For FormData uploads (like resume)
export type ProfileUpdateData = ProfileUpdateRequest | FormData;

export interface EmployerProfileUpdateRequest extends Partial<EmployerProfile> {}

export interface UploadImageResponse {
  message: string;
  profile_image_url: string;
}
