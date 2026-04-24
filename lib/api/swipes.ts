import { apiClient } from "@/lib/api/client";

export interface SwipeRequest {
  job_id: string;
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

export async function swipeJob(data: SwipeRequest): Promise<SwipeResponse> {
  const response = await apiClient.post<SwipeResponse>("/swipe/job", data);
  return response.data;
}
