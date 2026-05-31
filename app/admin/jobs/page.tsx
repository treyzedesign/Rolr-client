"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Briefcase, Search, Filter, ChevronLeft, ChevronRight, 
  MapPin, RefreshCw, ArrowUpDown, MoreHorizontal, 
  Calendar, CheckCircle2, XCircle, X, DollarSign, Building, Clock, Users as UsersIcon, ArrowLeft
} from "lucide-react";
import { Job, JobApplicant } from "@/types/job";
import { apiClient } from "@/lib/api/client";
import { applicationsApi } from "@/lib/api/applications";
import toast from "react-hot-toast";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [viewingApplicants, setViewingApplicants] = useState(false);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    filter: "newest",
    sortBy: "created_at",
    order: "desc",
    search: "",
  });

  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/jobs", {
        params: {
          filter: params.filter,
          page: params.page,
          limit: params.limit
        }
      });
      
      let fetchedJobs = data.jobs || [];
      
      if (params.search) {
        fetchedJobs = fetchedJobs.filter((j: Job) => 
          j.title.toLowerCase().includes(params.search.toLowerCase()) || 
          j.employer_name?.toLowerCase().includes(params.search.toLowerCase()) ||
          j.employer_id?.profile?.business_name?.toLowerCase().includes(params.search.toLowerCase())
        );
      }

      fetchedJobs.sort((a: Job, b: Job) => {
        let valA: any = a[params.sortBy as keyof Job];
        let valB: any = b[params.sortBy as keyof Job];
        
        if (params.sortBy === 'employer') {
          valA = a.employer_name || a.employer_id?.profile?.business_name || '';
          valB = b.employer_name || b.employer_id?.profile?.business_name || '';
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return params.order === 'asc' ? -1 : 1;
        if (valA > valB) return params.order === 'asc' ? 1 : -1;
        return 0;
      });

      setJobs(fetchedJobs);
      
      if (data.pagination) {
        setTotalJobs(data.pagination.total);
        setHasNextPage(params.page < data.pagination.pages);
      } else {
        setHasNextPage(fetchedJobs.length === params.limit);
      }
      
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.filter, params.sortBy, params.order, params.search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  const handleSort = (field: string) => {
    setParams(prev => ({
      ...prev,
      sortBy: field,
      order: prev.sortBy === field && prev.order === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };
  
  const handleViewApplicants = async (job: Job) => {
    setViewingApplicants(true);
    setIsLoadingApplicants(true);
    try {
      const data = await applicationsApi.getJobApplicants(job._id, 1, 100, 'all');
      setApplicants(data.applicants || []);
    } catch (error) {
      console.error("Failed to fetch applicants", error);
      toast.error("Failed to load applicants");
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const closeJobModal = () => {
    setSelectedJob(null);
    setViewingApplicants(false);
    setApplicants([]);
  };

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case "full_time":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Full Time</span>;
      case "part_time":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Part Time</span>;
      case "contract":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Contract</span>;
      case "internship":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Internship</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">{type?.replace('_', ' ')}</span>;
    }
  };

  const getApplicantStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>;
      case "pending":
      case "submitted":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">{status}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Job Management</h1>
          <p className="text-slate-400">Moderate and manage platform job postings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchJobs()}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search jobs or employers..."
              value={params.search}
              onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <select
              value={params.filter}
              onChange={(e) => setParams(prev => ({ ...prev, filter: e.target.value, page: 1 }))}
              className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm appearance-none transition-all"
            >
              <option value="newest">Latest Jobs</option>
              <option value="top">Top Swiped</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">Job Details <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'title' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('employer')}>
                  <div className="flex items-center gap-2">Employer <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'employer' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('job_type')}>
                  <div className="flex items-center gap-2">Type <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'job_type' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-2">Posted <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'created_at' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('applications_count')}>
                  <div className="flex items-center gap-2">Applicants <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'applications_count' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('is_active')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'is_active' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading && jobs.length === 0 ? (
                <tr key="loading">
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="mx-auto w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr key="empty">
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white mb-1">No jobs found</p>
                    <p>Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr 
                    key={job._id || `job-${index}`} 
                    onClick={() => setSelectedJob(job)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{job.title}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location || 'Remote'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {job.employer_id?.profile?.profile_image_url || job.employer_logo ? (
                            <img src={job.employer_id?.profile?.profile_image_url || job.employer_logo} alt="Company Logo" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Building className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-slate-300">
                          {job.employer_name || job.employer_id?.profile?.business_name || 'Unknown Company'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getJobTypeBadge(job.job_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(job.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-cyan-400 flex items-center gap-1.5">
                        <UsersIcon className="w-4 h-4" />
                        {job.total_applications || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.is_active || job.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <XCircle className="w-3 h-3" /> {job.status || 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 text-sm font-medium text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/30">
            <div className="text-sm text-slate-400">
              Page <span className="text-white font-medium">{params.page}</span>
              {totalJobs > 0 && ` of ${Math.ceil(totalJobs / params.limit)}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={params.page === 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!hasNextPage}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="flex gap-5">
                {!viewingApplicants && (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-lg">
                    {selectedJob.employer_id?.profile?.profile_image_url || selectedJob.employer_logo ? (
                      <img src={selectedJob.employer_id?.profile?.profile_image_url || selectedJob.employer_logo} alt="Company Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                )}
                {viewingApplicants && (
                  <button onClick={() => setViewingApplicants(false)} className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors self-start mt-1">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1.5">
                    {viewingApplicants ? `Applicants for ${selectedJob.title}` : selectedJob.title}
                  </h2>
                  {!viewingApplicants && (
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-400">
                      <span className="text-cyan-400 flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        {selectedJob.employer_name || selectedJob.employer_id?.profile?.business_name || 'Unknown Company'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {selectedJob.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {formatDate(selectedJob.created_at)}
                      </span>
                    </div>
                  )}
                  {viewingApplicants && (
                    <p className="text-sm text-slate-400">Total Applicants: <span className="text-cyan-400 font-medium">{selectedJob.total_applications || 0}</span></p>
                  )}
                </div>
              </div>
              <button 
                onClick={closeJobModal}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {!viewingApplicants ? (
                <div className="space-y-8">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center">
                      <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Status</div>
                      <div className="font-medium text-white capitalize">{selectedJob.status || (selectedJob.is_active ? 'Active' : 'Inactive')}</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center">
                      <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Job Type</div>
                      <div className="font-medium text-white capitalize">{selectedJob.job_type?.replace('_', ' ')}</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center">
                      <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Experience</div>
                      <div className="font-medium text-white capitalize">{selectedJob.experience_level} Level</div>
                    </div>
                    <div 
                      onClick={() => handleViewApplicants(selectedJob)}
                      className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl text-center cursor-pointer hover:bg-cyan-500/20 transition-colors group"
                    >
                      <div className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-1 group-hover:text-cyan-300">Applications</div>
                      <div className="font-medium text-cyan-400 text-lg group-hover:text-white flex items-center justify-center gap-2">
                        {selectedJob.total_applications || 0}
                        <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  {/* Salary & Requirements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-cyan-400" /> Salary Range
                      </h3>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 font-medium text-lg text-center">
                        {selectedJob.salary_min || selectedJob.salary_max 
                          ? `$${selectedJob.salary_min?.toLocaleString() || 0} - $${selectedJob.salary_max?.toLocaleString() || 'Unlimited'}`
                          : 'Salary not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">
                        Required Skills
                      </h3>
                      {selectedJob.required_skills && selectedJob.required_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.required_skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm border border-slate-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-sm">No specific skills listed</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">
                      Job Description
                    </h3>
                    <div 
                      className="bg-slate-800/30 border border-slate-800 p-5 rounded-xl text-slate-300 text-sm leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mb-2"
                      dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                    />
                  </div>

                  {/* Company Info */}
                  {selectedJob.employer_id?.profile?.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">
                        About {selectedJob.employer_id.profile.business_name || 'the Company'}
                      </h3>
                      <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-xl text-slate-400 whitespace-pre-wrap leading-relaxed text-sm">
                        {selectedJob.employer_id.profile.bio}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Applicants View */
                <div>
                  {isLoadingApplicants ? (
                    <div className="py-12 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                  ) : applicants.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-lg font-medium text-white mb-1">No applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applicants.map((app) => (
                        <div key={app._id} className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                              {app.job_seeker_id?.profile?.first_name?.charAt(0) || app.job_seeker_id?.email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {app.job_seeker_id?.profile?.first_name ? `${app.job_seeker_id.profile.first_name} ${app.job_seeker_id.profile.last_name || ''}` : app.job_seeker_id?.email}
                              </div>
                              <div className="text-xs text-slate-400 flex flex-wrap gap-2 mt-1">
                                {app.job_seeker_id?.profile?.job_category && <span>{app.job_seeker_id.profile.job_category}</span>}
                                {app.job_seeker_id?.profile?.experience_level && <span className="capitalize text-slate-500">• {app.job_seeker_id.profile.experience_level}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:justify-end">
                            <div className="text-xs text-slate-400 hidden sm:block">{formatDate(app.created_at)}</div>
                            {getApplicantStatusBadge(app.status)}
                            <button className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors shrink-0">
                              View User
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between gap-3">
              {!viewingApplicants && (
                <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium text-sm">
                  Take Down Job
                </button>
              )}
              {viewingApplicants && <div />} {/* Spacer */}
              <button 
                onClick={closeJobModal}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
