"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  CalendarDays, 
  Building, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  X, 
  CheckCircle, 
  Activity, 
  Award,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileText,
  Heart,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminAllApplications, AdminApplication, AdminApplicationsResponse } from "@/lib/api/admin";
import toast from "react-hot-toast";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);

  const fetchApplications = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const response = await getAdminAllApplications(statusFilter, page, pagination.limit);
      setApplications(response.applications || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
      });
    } catch (error) {
      console.error("Failed to fetch admin applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchApplications(newPage);
    }
  };

  // Helper getters to safely unpack candidate details
  const getSeekerName = (seeker: any): string => {
    if (!seeker) return "Unknown Candidate";
    if (typeof seeker === "object") {
      if (seeker.profile) {
        return `${seeker.profile.first_name || ""} ${seeker.profile.last_name || ""}`.trim() || seeker.email || "Unnamed Seeker";
      }
      return seeker.email || "Unnamed Seeker";
    }
    return "Candidate ID: " + String(seeker).substring(0, 8);
  };

  const getSeekerEmail = (seeker: any): string => {
    if (!seeker) return "No email";
    if (typeof seeker === "object") {
      return seeker.email || "No email";
    }
    return "";
  };

  const getEmployerName = (employer: any): string => {
    if (!employer) return "Unknown Company";
    if (typeof employer === "object") {
      return employer.profile?.business_name || employer.email || "Unnamed Company";
    }
    return "Company ID: " + String(employer).substring(0, 8);
  };

  const getJobTitle = (job: any): string => {
    if (!job) return "Deleted Position";
    if (typeof job === "object") {
      return job.title || "Untitled Position";
    }
    return "Job ID: " + String(job).substring(0, 8);
  };

  const getJobLocation = (job: any): string => {
    if (!job) return "Remote";
    if (typeof job === "object") {
      return job.location || "Remote";
    }
    return "Remote";
  };

  // Client-side search matching candidate name, job title, and company
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const candidateName = getSeekerName(app.job_seeker_id).toLowerCase();
      const jobTitle = getJobTitle(app.job_id).toLowerCase();
      const companyName = getEmployerName(app.employer_id).toLowerCase();
      const query = search.toLowerCase();
      return (
        candidateName.includes(query) ||
        jobTitle.includes(query) ||
        companyName.includes(query)
      );
    });
  }, [applications, search]);

  // Status badge styles
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "matched":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "pending":
      case "submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Mock stats counters based on total pagination & status mapping
  const statsMetrics = useMemo(() => {
    const total = pagination.total || applications.length;
    const pending = applications.filter(a => a.status === "pending" || a.status === "submitted").length * (pagination.pages || 1);
    const matched = applications.filter(a => a.status === "matched").length * (pagination.pages || 1);
    const approved = applications.filter(a => a.status === "approved").length * (pagination.pages || 1);
    
    return [
      { name: "Total Submissions", value: total, icon: FileText, color: "cyan" },
      { name: "Under Review", value: pending, icon: Activity, color: "blue" },
      { name: "Successful Matches", value: matched, icon: Heart, color: "pink" },
      { name: "Selections", value: approved, icon: CheckCircle, color: "green" },
    ];
  }, [applications, pagination]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Applications Management</h1>
          <p className="text-slate-400">Monitor and review candidate job applications platform-wide</p>
        </div>
        <button 
          onClick={() => fetchApplications()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all font-medium self-start sm:self-center cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsMetrics.map((stat, i) => (
          <div 
            key={i}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">{stat.name}</span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                stat.color === 'cyan' ? 'from-cyan-500/20 to-blue-500/20 text-cyan-400' :
                stat.color === 'blue' ? 'from-blue-500/20 to-indigo-500/20 text-blue-400' :
                stat.color === 'pink' ? 'from-pink-500/20 to-rose-500/20 text-pink-400' :
                'from-emerald-500/20 to-green-500/20 text-emerald-400'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by candidate name, job title, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm transition-all"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:text-sm appearance-none transition-all"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="matched">Matched</option>
              <option value="approved">Approved / Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FolderOpen className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="max-w-md mx-auto text-sm text-slate-400">
              No seeker application documents matched your current parameters. Try clearing the search or resetting the status dropdown.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Candidate Details</th>
                  <th className="px-6 py-4">Job & Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Match Reference</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 bg-slate-950/10">
                {filteredApplications.map((app) => {
                  const candidateName = getSeekerName(app.job_seeker_id);
                  const candidateEmail = getSeekerEmail(app.job_seeker_id);
                  const jobTitle = getJobTitle(app.job_id);
                  const companyName = getEmployerName(app.employer_id);

                  return (
                    <tr key={app._id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {candidateName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{jobTitle}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" /> {companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(app.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          <span className="capitalize">{app.status.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.match_id ? (
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-2 py-0.5 rounded">
                            {app.match_id.substring(0, 10)}...
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">Unmatched</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                          {formatDate(app.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedApplication(app)}
                          className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Review Application
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mt-6">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{applications.length}</span> of{" "}
            <span className="font-semibold text-white">{pagination.total}</span> submissions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
              className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-300 font-semibold px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || isLoading}
              className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* IMMERSIVE APPLICATION REVIEW MODAL DRAWER */}
      <AnimatePresence>
        {selectedApplication && (
          <ApplicationDetailModal 
            application={selectedApplication} 
            isOpen={true} 
            onClose={() => setSelectedApplication(null)} 
            getBadgeStyles={getStatusBadgeStyles}
            getSeekerName={getSeekerName}
            getSeekerEmail={getSeekerEmail}
            getEmployerName={getEmployerName}
            getJobTitle={getJobTitle}
            getJobLocation={getJobLocation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Detailed Application Modal */
interface ApplicationDetailModalProps {
  application: AdminApplication;
  isOpen: boolean;
  onClose: () => void;
  getBadgeStyles: (status: string) => string;
  getSeekerName: (seeker: any) => string;
  getSeekerEmail: (seeker: any) => string;
  getEmployerName: (employer: any) => string;
  getJobTitle: (job: any) => string;
  getJobLocation: (job: any) => string;
}

function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  getBadgeStyles,
  getSeekerName,
  getSeekerEmail,
  getEmployerName,
  getJobTitle,
  getJobLocation
}: ApplicationDetailModalProps) {
  
  const seeker = application.job_seeker_id;
  const employer = application.employer_id;
  const job = application.job_id;

  const candidateSkills = useMemo(() => {
    if (seeker && typeof seeker === "object") {
      return seeker.profile?.skills || [];
    }
    return [];
  }, [seeker]);

  const candidateBio = useMemo(() => {
    if (seeker && typeof seeker === "object") {
      return seeker.profile?.bio || "No professional overview bio provided by job seeker.";
    }
    return "No professional overview bio provided.";
  }, [seeker]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60]"
        onClick={onClose}
      />

      {/* Modal Drawer */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-slate-800/80 p-6 bg-slate-950/40">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                  Platform Application Audit
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {getSeekerName(seeker)}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyles(application.status)}`}>
                    Status: {application.status}
                  </span>
                  {application.match_id && (
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-2.5 py-0.5 rounded-full">
                      Match ID: {application.match_id}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/10">
            {/* Seeker Profile Section */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" /> Seeker Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Full Name</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {getSeekerName(seeker)}
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Primary Email</span>
                  <span className="text-sm font-semibold text-slate-300 mt-0.5 block">
                    {getSeekerEmail(seeker)}
                  </span>
                </div>
                {seeker && typeof seeker === "object" && seeker.profile && (
                  <>
                    <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Experience Level</span>
                      <span className="text-sm font-bold text-white mt-0.5 block capitalize">
                        {seeker.profile.experience_level || "Not set"}
                      </span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Phone Number</span>
                      <span className="text-sm font-bold text-white mt-0.5 block">
                        {seeker.profile.phone || "Not provided"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Candidate Bio */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Seeker Professional Summary</span>
                <p className="text-xs text-slate-350 leading-relaxed italic">
                  "{candidateBio}"
                </p>
              </div>

              {/* Skills list */}
              {candidateSkills.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-2">Verified Professional Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Position & Employer Section */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" /> Position & Employer Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Job Title</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {getJobTitle(job)}
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Hiring Company</span>
                  <span className="text-sm font-semibold text-cyan-400 mt-0.5 block">
                    {getEmployerName(employer)}
                  </span>
                </div>
                {job && typeof job === "object" && (
                  <>
                    <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Location</span>
                      <span className="text-sm font-semibold text-slate-300 mt-0.5 block">
                        {getJobLocation(job)} ({job.job_type?.replace("_", " ") || "Full Time"})
                      </span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-850/60 rounded-xl p-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Salary Compensation</span>
                      <span className="text-sm font-bold text-white mt-0.5 block">
                        {job.salary_min && job.salary_max 
                          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} per annum`
                          : "Undisclosed"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Employer Info details if available */}
              {employer && typeof employer === "object" && employer.profile && (
                <div className="border-t border-slate-800/60 pt-4">
                  <div className="flex items-center gap-3">
                    {employer.profile.profile_image_url && (
                      <img src={employer.profile.profile_image_url} alt="Company Logo" className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                    )}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Company Website & Contact</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {employer.profile.website_url || "No website"} • Contact: {employer.profile.phone || "No phone"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Match audit stats if available */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-950/20 border border-slate-850 rounded-xl">
                <CalendarDays className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Submitted On</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    {formatDate(application.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-950/20 border border-slate-850 rounded-xl">
                <Activity className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Last Processed</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    {formatDate(application.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-800/80 p-6 bg-slate-950/40 flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Audit Code: {application._id}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
