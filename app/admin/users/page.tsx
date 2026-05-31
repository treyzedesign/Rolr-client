"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight, 
  Shield, Briefcase, User as UserIcon, MapPin,
  RefreshCw, ArrowUpDown, MoreHorizontal, Mail, Phone,
  Calendar, CheckCircle2, XCircle, X, ExternalLink, Link as LinkIcon
} from "lucide-react";
import { getUsers, GetUsersParams, AdminUser } from "@/lib/api/users";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [params, setParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    sortBy: "role",
    order: "asc",
    role: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clean up empty params
      const cleanParams: GetUsersParams = { ...params };
      if (!cleanParams.role) delete cleanParams.role;
      if (!cleanParams.jobCategory) delete cleanParams.jobCategory;
      if (!cleanParams.experienceLevel) delete cleanParams.experienceLevel;
      if (!cleanParams.employmentStatus) delete cleanParams.employmentStatus;

      const response = await getUsers(cleanParams);
      if (response.success || response.data) {
        setUsers(response.data || []);
        if (response.pagination) {
          setTotalUsers(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: string) => {
    setParams(prev => ({
      ...prev,
      sortBy: field,
      order: prev.sortBy === field && prev.order === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const getFullName = (user: AdminUser) => {
    if (user.role === 'employer' && user.profile?.business_name) {
      return user.profile.business_name;
    }
    const first = user.profile?.first_name || '';
    const last = user.profile?.last_name || '';
    if (!first && !last) return 'No Name';
    return `${first} ${last}`.trim();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><Shield className="w-3 h-3" /> Admin</span>;
      case "employer":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"><Briefcase className="w-3 h-3" /> Employer</span>;
      case "job_seeker":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><UserIcon className="w-3 h-3" /> Candidate</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{role}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
          <p className="text-slate-400">View and manage all platform users ({totalUsers} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchUsers()}
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
              placeholder="Filter by Job Category..."
              value={params.jobCategory || ""}
              onChange={(e) => setParams(prev => ({ ...prev, jobCategory: e.target.value, page: 1 }))}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <select
              value={params.role || ""}
              onChange={(e) => setParams(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm appearance-none transition-all"
            >
              <option value="">All Roles</option>
              <option value="job_seeker">Candidates</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <div className="relative flex-1 max-w-xs">
            <select
              value={params.experienceLevel || ""}
              onChange={(e) => setParams(prev => ({ ...prev, experienceLevel: e.target.value as any, page: 1 }))}
              className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm appearance-none transition-all"
            >
              <option value="">All Experience</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-2">User <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'email' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-2">Role <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'role' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-2">Date Joined <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'created_at' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('is_active')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className={`w-3 h-3 ${params.sortBy === 'is_active' ? 'text-cyan-400' : ''}`} /></div>
                </th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading && users.length === 0 ? (
                <tr key="loading">
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="mx-auto w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr key="empty">
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white mb-1">No users found</p>
                    <p>Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr 
                    key={user._id || `user-${index}`} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile?.profile_image_url ? (
                          <img src={user.profile.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-600 group-hover:border-cyan-500/50 transition-colors" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white font-medium shrink-0 group-hover:border-cyan-500/50 transition-colors">
                            {getFullName(user).charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{getFullName(user)}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="px-3 py-1.5 text-sm font-medium text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/30">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">{(params.page! - 1) * params.limit! + 1}</span> to <span className="text-white font-medium">{Math.min(params.page! * params.limit!, totalUsers)}</span> of <span className="text-white font-medium">{totalUsers}</span> users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={params.page === 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && params.page! > 3) {
                    pageNum = params.page! - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setParams(prev => ({ ...prev, page: pageNum }))}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        params.page === pageNum
                          ? 'bg-cyan-500 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                disabled={params.page === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-4">
                {selectedUser.profile?.profile_image_url ? (
                  <img src={selectedUser.profile.profile_image_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl text-white font-bold shadow-lg">
                    {getFullName(selectedUser).charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    {getFullName(selectedUser)}
                    {selectedUser.is_email_verified && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedUser.email}</span>
                    {selectedUser.profile?.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedUser.profile.phone}</span>
                    )}
                    {selectedUser.profile?.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedUser.profile.location}</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Status Section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Role</div>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="flex-1 border-l border-slate-700 pl-4">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Account Status</div>
                  <div>
                    {selectedUser.is_active ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Active</span>
                    ) : (
                      <span className="text-slate-400 font-medium flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 border-l border-slate-700 pl-4">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Joined Date</div>
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(selectedUser.created_at)}
                  </div>
                </div>
              </div>

              {/* Bio/Description */}
              {selectedUser.profile?.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">About</h3>
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedUser.profile.bio}
                  </div>
                </div>
              )}

              {/* Role-Specific Details */}
              {selectedUser.role === 'job_seeker' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Professional Info</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-slate-400">Job Category</span>
                          <span className="text-white font-medium">{selectedUser.profile?.job_category || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Experience</span>
                          <span className="text-white font-medium capitalize">{selectedUser.profile?.experience_level ? `${selectedUser.profile.experience_level} Level (${selectedUser.profile.experience_years} yrs)` : 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Status</span>
                          <span className="text-white font-medium capitalize">{selectedUser.profile?.employment_status?.replace('_', ' ') || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Availability</span>
                          <span className="text-white font-medium">{selectedUser.profile?.availability || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Work Preference</span>
                          <span className="text-white font-medium">{selectedUser.profile?.work_type_preference || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Salary Range</span>
                          <span className="text-white font-medium text-right">
                            {selectedUser.profile?.preferred_salary_min || selectedUser.profile?.preferred_salary_max 
                              ? `$${selectedUser.profile?.preferred_salary_min?.toLocaleString() || 0} - $${selectedUser.profile?.preferred_salary_max?.toLocaleString() || 'Any'}`
                              : 'Not specified'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {selectedUser.profile?.skills && selectedUser.profile.skills.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.profile.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Education</h3>
                      {selectedUser.profile?.education_level || selectedUser.profile?.education_field ? (
                        <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                          <div className="text-white font-medium">{selectedUser.profile?.education_field || 'Unspecified Field'}</div>
                          <div className="text-sm text-slate-400">{selectedUser.profile?.education_level || 'Unspecified Level'}</div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No education provided</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Work Experience</h3>
                      {selectedUser.profile?.work_experience ? (
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                          {selectedUser.profile.work_experience}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No work experience provided</p>
                      )}
                    </div>
                    
                    {/* Links & Attachments */}
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Attachments & Links</h3>
                      <div className="space-y-2">
                        {selectedUser.profile?.resume_url && (
                          <a href={selectedUser.profile.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                            <span className="flex items-center gap-2 font-medium text-sm"><LinkIcon className="w-4 h-4" /> Resume / CV</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {selectedUser.profile?.portfolio_url && (
                          <a href={selectedUser.profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                            <span className="flex items-center gap-2 font-medium text-sm"><LinkIcon className="w-4 h-4" /> Portfolio</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {selectedUser.profile?.linkedin_url && (
                          <a href={selectedUser.profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            <span className="flex items-center gap-2 font-medium text-sm"><LinkIcon className="w-4 h-4" /> LinkedIn</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {selectedUser.profile?.voice_intro_url && (
                          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                            <div className="text-sm font-medium text-slate-300 mb-2">Voice Intro</div>
                            <audio controls className="w-full h-10 rounded-lg">
                              <source src={selectedUser.profile.voice_intro_url} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'employer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Company Info</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-slate-400">Industry</span>
                          <span className="text-white font-medium">{selectedUser.profile?.industry || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Business Name</span>
                          <span className="text-white font-medium">{selectedUser.profile?.business_name || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">CAC Number</span>
                          <span className="text-white font-medium font-mono bg-slate-800 px-2 py-0.5 rounded">{selectedUser.profile?.cac_number || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-400">Timeline</span>
                          <span className="text-white font-medium capitalize">{selectedUser.profile?.expected_hiring_timeline?.replace('_', ' ') || 'N/A'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Contact Person</h3>
                      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                          <span className="text-slate-400">Name</span>
                          <span className="text-white font-medium">{selectedUser.profile?.contact_person_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Role</span>
                          <span className="text-white font-medium">{selectedUser.profile?.contact_person_role || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedUser.profile?.website_url && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Links</h3>
                        <a href={selectedUser.profile.website_url.startsWith('http') ? selectedUser.profile.website_url : `https://${selectedUser.profile.website_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          <span className="flex items-center gap-2 font-medium text-sm"><LinkIcon className="w-4 h-4" /> Company Website</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
