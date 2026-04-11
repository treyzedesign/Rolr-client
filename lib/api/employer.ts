import { apiClient } from "@/lib/api/client";
import type { Candidate, EmployerProfileInput } from "@/types/employer";

export async function createOrUpdateEmployerProfile(payload: EmployerProfileInput) {
  const { data } = await apiClient.post("/api/profile", payload);
  return data;
}

export async function fetchEmployerCandidates(params: Record<string, string | number>) {
  const { data } = await apiClient.get<Candidate[]>("/api/employer/candidates", {
    params,
  });
  return data;
}

export async function fetchCandidateById(candidateId: string) {
  const { data } = await apiClient.get<Candidate>(`/api/candidates/${candidateId}`);
  return data;
}

export async function swipeOnCandidate(candidateId: string, accepted: boolean) {
  const { data } = await apiClient.post("/api/swipe/candidate", {
    candidateId,
    direction: accepted ? "up" : "down",
  });
  return data;
}
