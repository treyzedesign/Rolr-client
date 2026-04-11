"use client";

import { create } from "zustand";
import { mockCandidates } from "@/lib/mock/candidates";
import {
  createOrUpdateEmployerProfile,
  fetchCandidateById,
  fetchEmployerCandidates,
  swipeOnCandidate,
} from "@/lib/api/employer";
import type { Candidate, EmployerProfileInput } from "@/types/employer";

interface EmployerState {
  profileSaved: boolean;
  candidates: Candidate[];
  isLoadingCandidates: boolean;
  error: string | null;
  saveProfile: (payload: EmployerProfileInput) => Promise<void>;
  loadCandidates: (preferences: Record<string, string | number>) => Promise<void>;
  getCandidateById: (candidateId: string) => Promise<Candidate | null>;
  swipeCandidate: (candidateId: string, accepted: boolean) => Promise<void>;
}

export const useEmployerStore = create<EmployerState>((set, get) => ({
  profileSaved: false,
  candidates: [],
  isLoadingCandidates: false,
  error: null,
  async saveProfile(payload) {
    try {
      await createOrUpdateEmployerProfile(payload);
      set({ profileSaved: true, error: null });
    } catch {
      set({ error: "Could not save profile to backend." });
      throw new Error("PROFILE_SAVE_FAILED");
    }
  },
  async loadCandidates(preferences) {
    set({ isLoadingCandidates: true, error: null });
    try {
      const data = await fetchEmployerCandidates(preferences);
      set({
        candidates: data.length ? data : mockCandidates,
        isLoadingCandidates: false,
      });
    } catch {
      set({
        candidates: mockCandidates,
        isLoadingCandidates: false,
        error: "Backend unavailable. Showing demo candidates.",
      });
    }
  },
  async getCandidateById(candidateId) {
    const candidate = get().candidates.find((item) => item.id === candidateId);
    if (candidate) {
      return candidate;
    }
    try {
      return await fetchCandidateById(candidateId);
    } catch {
      return null;
    }
  },
  async swipeCandidate(candidateId, accepted) {
    try {
      await swipeOnCandidate(candidateId, accepted);
    } finally {
      set((state) => ({
        candidates: state.candidates.filter((item) => item.id !== candidateId),
      }));
    }
  },
}));
