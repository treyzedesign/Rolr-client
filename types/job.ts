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
      bio?: string;
      business_name?: string;
      industry?: string;
      phone?: string;
      profile_image_url?: string;
      website_url?: string;
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
