import { apiClient } from './client';
import { ApplicationsResponse, ApplicationResponse, JobApplicantsResponse } from '@/types/job';

export const applicationsApi = {
  // Get all applications for the authenticated job seeker
  getApplications: async (page: number = 1, limit: number = 10): Promise<ApplicationsResponse> => {
    const response = await apiClient.get('/applications', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get application details by ID
  getApplicationById: async (applicationId: string): Promise<ApplicationResponse> => {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Get applicants for a specific job
  getJobApplicants: async (jobId: string, page: number = 1, limit: number = 10, status: string = 'submitted'): Promise<JobApplicantsResponse> => {
    const response = await apiClient.get(`/applications/job/${jobId}/applicants`, {
      params: { page, limit, status }
    });
    return response.data;
  }
};
