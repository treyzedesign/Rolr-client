"use client";

import { create } from "zustand";
import toast from "react-hot-toast";
import { 
  getAllJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  getEmployerJobs 
} from "@/lib/api/jobs";
import type { Job, CreateJobRequest, UpdateJobRequest } from "@/types/job";

interface JobState {
  jobs: Job[];
  employerJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Actions
  fetchAllJobs: () => Promise<void>;
  fetchEmployerJobs: () => Promise<void>;
  fetchJobById: (jobId: string) => Promise<void>;
  createJob: (jobData: CreateJobRequest) => Promise<void>;
  updateJob: (jobId: string, jobData: UpdateJobRequest) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  clearCurrentJob: () => void;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  employerJobs: [],
  currentJob: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchAllJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await getAllJobs();
      set({ jobs, isLoading: false });
    } catch (error) {
      toast.error("Failed to fetch jobs");
      set({ 
        error: "Failed to fetch jobs", 
        isLoading: false 
      });
    }
  },

  fetchEmployerJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const employerJobs = await getEmployerJobs();
      set({ employerJobs, isLoading: false });
    } catch (error) {
      toast.error("Failed to fetch your jobs");
      set({ 
        error: "Failed to fetch your jobs", 
        isLoading: false 
      });
    }
  },

  fetchJobById: async (jobId: string) => {
    set({ isLoading: true, error: null });
    try {
      const job = await getJobById(jobId);
      set({ currentJob: job, isLoading: false });
    } catch (error) {
      toast.error("Failed to fetch job details");
      set({ 
        error: "Failed to fetch job details", 
        isLoading: false 
      });
    }
  },

  createJob: async (jobData: CreateJobRequest) => {
    set({ isCreating: true, error: null });
    try {
      const newJob = await createJob(jobData);
      set(state => ({ 
        employerJobs: [newJob, ...state.employerJobs],
        isCreating: false 
      }));
      toast.success("Job created successfully");
    } catch (error) {
      toast.error("Failed to create job");
      set({ 
        error: "Failed to create job", 
        isCreating: false 
      });
      throw error;
    }
  },

  updateJob: async (jobId: string, jobData: UpdateJobRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedJob = await updateJob(jobId, jobData);
      set(state => ({
        employerJobs: state.employerJobs.map(job => 
          job._id === jobId ? updatedJob : job
        ),
        currentJob: state.currentJob?._id === jobId ? updatedJob : state.currentJob,
        isUpdating: false
      }));
      toast.success("Job updated successfully");
    } catch (error) {
      toast.error("Failed to update job");
      set({ 
        error: "Failed to update job", 
        isUpdating: false 
      });
      throw error;
    }
  },

  deleteJob: async (jobId: string) => {
    set({ isDeleting: true, error: null });
    try {
      await deleteJob(jobId);
      set(state => ({
        employerJobs: state.employerJobs.filter(job => job._id !== jobId),
        currentJob: state.currentJob?._id === jobId ? null : state.currentJob,
        isDeleting: false
      }));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
      set({ 
        error: "Failed to delete job", 
        isDeleting: false 
      });
      throw error;
    }
  },

  clearCurrentJob: () => set({ currentJob: null }),
  clearError: () => set({ error: null }),
}));
