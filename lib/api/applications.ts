import { apiClient } from './client';
import { ApplicationsResponse, ApplicationResponse } from '@/types/job';

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
  }
};
