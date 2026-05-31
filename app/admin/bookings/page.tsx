"use client";

import { useEffect, useState } from "react";
import { 
  adminGetBookings, 
  adminCancelBooking, 
  adminResendBookingLink,
  AdminBooking 
} from "@/lib/api/admin";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Video, 
  MoreVertical, 
  Ban, 
  Mail, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "booked" | "expired">("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // For the active dropdown menu row
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [statusFilter, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminGetBookings(statusFilter, page, 20);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load booked sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking and delete the calendar event?")) return;
    
    try {
      setActionLoading(id);
      await adminCancelBooking(id);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (id: string) => {
    try {
      setActionLoading(id);
      await adminResendBookingLink(id);
      toast.success("Booking link resent to candidate");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend link");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Booked</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Expired</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Booked Sessions</h1>
          <p className="text-slate-400 mt-1">Manage platform-wide interview scheduling and Google Meets.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          {(['all', 'pending', 'booked', 'expired'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPage(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                statusFilter === filter 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          <CalendarIcon className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Employer</th>
                <th className="px-6 py-4 font-semibold">Scheduled Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-400">Loading bookings...</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">No bookings found</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your status filter.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{booking.candidate_id?.email || "Unknown Candidate"}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        ID: {booking.candidate_id?._id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{booking.employer_id?.email || "Unknown Employer"}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        Score: {booking.interview_session_id?.overall_score}/10
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.chosen_slot ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{formatDate(booking.chosen_slot.start)}</span>
                          <span className="text-xs text-slate-500">to {formatDate(booking.chosen_slot.end)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not selected yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Primary Action */}
                        {booking.status === 'booked' && booking.meet_link ? (
                          <a 
                            href={booking.meet_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Join Meet
                          </a>
                        ) : booking.status === 'pending' ? (
                          <span className="text-xs text-slate-500 italic pr-2">Awaiting pick</span>
                        ) : null}

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === booking._id ? null : booking._id);
                            }}
                            disabled={actionLoading === booking._id}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? (
                              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>

                          {activeMenuId === booking._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right animate-in fade-in zoom-in duration-100">
                              <div className="p-1">
                                {booking.status === 'pending' && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleResend(booking._id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                  >
                                    <Mail className="w-4 h-4" /> Resend Link
                                  </button>
                                )}
                                {(booking.status === 'booked' || booking.status === 'pending') && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleCancel(booking._id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Ban className="w-4 h-4" /> Cancel Session
                                  </button>
                                )}
                                {booking.meet_link && (
                                  <a 
                                    href={booking.meet_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" /> Open Meet Link
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
          <span className="text-sm text-slate-500">
            Showing page {page}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={bookings.length < 20}
              className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
