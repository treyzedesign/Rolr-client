import { apiClient } from "@/lib/api/client";
import type { CandidateProfile, EmployerProfile, ProfileResponse, ProfileUpdateRequest, UploadImageResponse } from "@/types/profile";

export async function getMyProfile(): Promise<CandidateProfile | EmployerProfile> {
  const { data } = await apiClient.get<ProfileResponse>("/profile/me");
  return data.profile;
}

export async function updateProfile(profileData: ProfileUpdateRequest | FormData): Promise<CandidateProfile | EmployerProfile> {
  let formData: FormData;
  
  // Check if profileData is already FormData (for file uploads)
  if (profileData instanceof FormData) {
    formData = profileData;
  } else {
    // Create FormData from regular object
    formData = new FormData();
    
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
  }
  
  const { data } = await apiClient.post<ProfileResponse>("/profile", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.profile;
}

export async function getUserProfile(userId: string): Promise<CandidateProfile | EmployerProfile> {
  const { data } = await apiClient.get<ProfileResponse>(`/profile/${userId}`);
  return data.profile;
}

export async function uploadProfileImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('profile_image', file);

  const response = await apiClient.post('/profile/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

