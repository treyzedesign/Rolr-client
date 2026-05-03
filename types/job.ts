export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  job_type: "full_time" | "part_time" | "contract" | "internship";
  experience_level: "entry" | "mid" | "senior";
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  employer_id: {
    _id: string;
    email: string;
    profile: {
      bio: string | null;
      business_name: string;
      industry: string;
      phone: string | null;
      profile_image_url: string | null;
      website_url: string | null;
    };
  };
  employer_name?: string;
  employer_logo?: string;
  status?: "active" | "closed" | "draft";
  created_at?: string;
  updated_at?: string;
  applications_count?: number;
  is_active?: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  job_type: "full_time" | "part_time" | "contract" | "internship";
  experience_level: "entry" | "mid" | "senior";
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  location?: string;
  job_type?: "full_time" | "part_time" | "contract" | "internship";
  experience_level?: "entry" | "mid" | "senior";
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
}

export interface JobsResponse {
  message: string;
  jobs: Job[];
}

export interface JobResponse {
  message: string;
  job: Job;
}

export interface Application {
  _id: string;
  match_id: string | null;
  job_seeker_id: string;
  employer_id: string;
  job_id: {
    _id: string;
    employer_id: {
      _id: string;
      email: string;
      profile: {
        _id: string;
        bio: string | null;
        business_name: string;
        industry: string;
        phone: string | null;
        profile_image_url: string | null;
        website_url: string | null;
      };
    };
    title: string;
    description: string;
    required_skills: string[];
    salary_min: number;
    salary_max: number;
    location: string;
    job_type: "full_time" | "part_time" | "contract" | "internship";
    experience_level: "entry" | "mid" | "senior";
    is_active: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
  };
  status: "pending" | "reviewing" | "accepted" | "rejected" | "interview_scheduled";
  questions: any[];
  answers: any[];
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApplicationResponse {
  application: Application;
}

export interface JobApplicant {
  _id: string;
  job_seeker_id: {
    _id: string;
    email: string;
    profile: {
      first_name?: string;
      last_name?: string;
      employment_status?: string;
      experience_level?: string;
      job_category?: string;
      location?: string;
      phone?: string;
      profile_image_url?: string;
      voice_intro_url?: string;
      bio?: string;
      skills: string[]
    };
  };
  job_id: {
    _id: string;
    title: string;
    location: string;
  };
  status: "all" | "pending" | "submitted" | "approved" | "rejected";
  created_at: string;
}

export interface JobApplicantsResponse {
  applicants: JobApplicant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
