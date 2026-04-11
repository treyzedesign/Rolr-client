import { apiClient } from "@/lib/api/client";
import type { Job, CreateJobRequest, UpdateJobRequest, JobsResponse, JobResponse } from "@/types/job";

export async function getAllJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<JobsResponse>("/jobs");
  return data.jobs;
}

export async function getJobById(jobId: string): Promise<Job> {
  const { data } = await apiClient.get<JobResponse>(`/jobs/${jobId}`);
  return data.job;
}

export async function createJob(jobData: CreateJobRequest): Promise<Job> {
  const { data } = await apiClient.post<JobResponse>("/jobs", jobData);
  return data.job;
}

export async function updateJob(jobId: string, jobData: UpdateJobRequest): Promise<Job> {
  const { data } = await apiClient.put<JobResponse>(`/jobs/${jobId}`, jobData);
  return data.job;
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}`);
}

export async function getEmployerJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<JobsResponse>("/jobs/employer/jobs");
  return data.jobs;
}
