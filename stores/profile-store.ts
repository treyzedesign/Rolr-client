"use client";

import { create } from "zustand";
import toast from "react-hot-toast";
import { getMyProfile, updateProfile, uploadProfileImage } from "@/lib/api/profile";
import type { CandidateProfile, EmployerProfile, ProfileUpdateRequest } from "@/types/profile";

// Type guard functions
function isCandidateProfile(profile: CandidateProfile | EmployerProfile): profile is CandidateProfile {
  return 'job_category' in profile;
}

function isEmployerProfile(profile: CandidateProfile | EmployerProfile): profile is EmployerProfile {
  return 'business_name' in profile;
}

interface ProfileState {
  profile: CandidateProfile | EmployerProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest | FormData) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  clearProfile: () => void;
  // Type getters
  getCandidateProfile: () => CandidateProfile | null;
  getEmployerProfile: () => EmployerProfile | null;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  
  async fetchProfile() {
    set({ isLoading: true, error: null });
    try {
      const profile = await getMyProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      toast.error("Failed to load profile");
      set({ 
        error: "Failed to load profile", 
        isLoading: false 
      });
    }
  },
  
  async updateProfile(data: ProfileUpdateRequest) {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await updateProfile(data);
      set({ 
        profile: { ...get().profile, ...updatedProfile }, 
        isLoading: false 
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      set({ 
        error: "Failed to update profile", 
        isLoading: false 
      });
      throw error;
    }
  },
  
  async uploadImage(file: File) {
    set({ isLoading: true, error: null });
    try {
      const response = await uploadProfileImage(file);
      toast.success(response.message);
      
      // Refresh profile to get updated image
      await get().fetchProfile();
    } catch (error) {
      toast.error("Failed to upload profile image");
      set({ 
        error: "Failed to upload profile image", 
        isLoading: false 
      });
      throw error;
    }
  },
  
  
  
  getCandidateProfile() {
    const profile = get().profile;
    return profile && isCandidateProfile(profile) ? profile : null;
  },
  
  getEmployerProfile() {
    const profile = get().profile;
    return profile && isEmployerProfile(profile) ? profile : null;
  },
  
  clearProfile() {
    set({ profile: null, error: null });
  },
}));

