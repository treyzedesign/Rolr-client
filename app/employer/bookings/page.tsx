"use client";

import { useEffect, useState } from "react";
import { interviewsApi, EmployerBooking } from "@/lib/api/interviews";
import { 
  Calendar as CalendarIcon, 
  Video, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmployerBookingsPage() {
  const [bookings, setBookings] = useState<EmployerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "booked" | "expired">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await interviewsApi.getEmployerBookings(statusFilter, page, 20);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load booked sessions");
    } finally {
      setLoading(false);
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Booked</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Expired</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Booked Meets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and join your scheduled candidate interviews.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
          {(['all', 'pending', 'booked', 'expired'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPage(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                statusFilter === filter 
                  ? 'bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
          <CalendarIcon className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Job Reference</th>
                <th className="px-6 py-4 font-semibold">Scheduled Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Loading bookings...</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No bookings found</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your status filter.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">
                        {booking.candidate_id?.first_name || "Unknown"} {booking.candidate_id?.last_name || ""}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {booking.candidate_id?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">
                        {booking.interview_session_id?.job_id?.title || "Position"}
                      </div>
                      <div className="text-xs text-slate-500">
                        AI Score: {booking.interview_session_id?.overall_score}/10
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.chosen_slot ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-200">{formatDate(booking.chosen_slot.start)}</span>
                          <span className="text-xs text-slate-500">to {formatDate(booking.chosen_slot.end)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Candidate deciding</span>
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
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                          >
                            <Video className="w-4 h-4" />
                            Join Meet
                          </a>
                        ) : booking.status === 'pending' ? (
                          <span className="text-xs text-slate-400 italic pr-2">Awaiting</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
          <span className="text-sm text-slate-500">
            Showing page {page}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={bookings.length < 20}
              className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
