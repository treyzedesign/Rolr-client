import { apiClient } from "@/lib/api/client";
import type { EmployerRegisterRequest,AuthResponse, JobSeekerRegisterRequest, LoginRequest, VerifyEmailRequest, VerifyEmailResponse, ResendOtpRequest, ResendOtpResponse } from "@/types/auth";

export async function registerJobSeeker(payload: JobSeekerRegisterRequest) {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/job-seeker", payload);
  return data;
}

export async function loginUser(payload: LoginRequest) {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<AuthResponse["user"]>("/auth/me");
  return data;
}

export async function registerEmployer(payload: EmployerRegisterRequest) {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/employer", payload);
  return data;
}

export async function verifyEmail(payload: VerifyEmailRequest) {
  const { data } = await apiClient.post<VerifyEmailResponse>("/auth/verify-email", payload);
  return data;
}

export async function resendOtp(payload: ResendOtpRequest) {
  const { data } = await apiClient.post<ResendOtpResponse>("/auth/resend-otp", payload);
  return data;
}
