import { apiClient } from "@/lib/api/client";

export interface SwipeRequest {
  job_id: string;
  action: "left" | "right"; // left = reject, right = like
}

export interface CandidateSwipeRequest {
  candidate_id: string;
  action: "left" | "right"; // left = reject, right = like
}

export interface SwipeResponse {
  message: string;
  swipe: {
    _id: string;
    job_id: string;
    action: "left" | "right";
    created_at: string;
  };
}

export interface CandidateSwipeResponse {
  message: string;
  swipe: {
    _id: string;
    candidate_id: string;
    action: "left" | "right";
    created_at: string;
  };
}

export async function swipeJob(data: SwipeRequest): Promise<SwipeResponse> {
  const response = await apiClient.post<SwipeResponse>("/swipe/job", data);
  return response.data;
}

export async function swipeCandidate(data: CandidateSwipeRequest): Promise<CandidateSwipeResponse> {
  const response = await apiClient.post<CandidateSwipeResponse>("/swipe/candidate", data);
  return response.data;
}
