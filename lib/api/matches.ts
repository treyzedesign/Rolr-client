import { apiClient } from './client';

export interface MatchedCandidate {
  _id: string;
  candidate: {
    _id: string;
    email: string;
    role: string;
    profile: {
      _id: string;
      first_name?: string;
      last_name?: string;
      bio?: string;
      location?: string;
      skills?: string[];
      experience_level?: string;
      job_category?: string;
      employment_status?: string;
      profile_image_url?: string;
      voice_intro_url?: string;
      phone?: string;
    };
  };
  job: {
    _id: string;
    title: string;
    location: string;
    job_type: string;
    experience_level: string;
    description: string;
    required_skills?: string[];
    salary_min?: number;
    salary_max?: number;
  };
  match: {
    _id: string;
    match_type: string;
    status: string;
    created_at: string;
  };
  created_at: string;
}

export interface MatchesResponse {
  matchedCandidates: MatchedCandidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const matchesApi = {
  // Get all matched candidates for the employer
  getMatchedCandidates: async (page: number = 1, limit: number = 20): Promise<MatchesResponse> => {
    const response = await apiClient.get('/matches/matched-candidates', {
      params: { page, limit }
    });
    return response.data;
  }
};
