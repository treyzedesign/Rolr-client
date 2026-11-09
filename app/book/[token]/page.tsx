"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, AlertCircle, Briefcase, User, CheckCircle, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { bookingApi, BookingData } from "@/lib/api/booking";
import toast from "react-hot-toast";

type GroupedSlots = {
  [dateStr: string]: { _id: string; start: string; end: string }[];
};

export default function CandidateBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBookingDetails();
    }
  }, [token]);

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getBookingDetails(token);
      setBookingData(data);
      
      if (data.available_slots && data.available_slots.length > 0) {
        const earliest = new Date(data.available_slots[0].start);
        setCurrentMonthDate(new Date(earliest.getFullYear(), earliest.getMonth(), 1));
        setSelectedDateStr(getLocalDateString(earliest));
      }
    } catch (err: any) {
      console.error("Failed to fetch booking details:", err);
      const status = err?.response?.status;
      if (status === 403) {
        setError("This booking link has expired or is no longer valid.");
      } else if (status === 404) {
        setError("Invalid booking link. We couldn't find your interview session.");
      } else {
        setError("An unexpected error occurred while loading your booking page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const groupedSlots = useMemo(() => {
    if (!bookingData?.available_slots) return {};
    const groups: GroupedSlots = {};
    bookingData.available_slots.forEach((slot) => {
      const d = new Date(slot.start);
      const localDateStr = getLocalDateString(d);
      if (!groups[localDateStr]) groups[localDateStr] = [];
      groups[localDateStr].push({ _id: slot._id, start: slot.start, end: slot.end });
    });
    return groups;
  }, [bookingData]);

  const handleConfirmSlot = async () => {
    if (selectedSlotId === null) return;
    
    setIsSubmitting(true);
    try {
      await bookingApi.confirmBooking(token, selectedSlotId);
      toast.success("Interview booked successfully!");
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Failed to confirm booking:", err);
      const status = err?.response?.status;
      if (status === 400) {
        toast.error("This slot is already booked or invalid. Please refresh and try again.");
      } else if (status === 403) {
        toast.error("Booking link has expired.");
      } else {
        toast.error("Failed to confirm interview slot. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-800">Preparing your booking page...</h2>
        <p className="text-slate-500 mt-2">Securely retrieving interview slots.</p>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Link Unavailable</h2>
          <p className="text-slate-600 leading-relaxed mb-8">{error}</p>
          <p className="text-sm text-slate-500">
            Please contact the employer or support if you believe this is an error.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Interview Confirmed!</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Your interview has been successfully scheduled. Both you and the employer have been emailed the calendar invitation and Google Meet link.
          </p>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 inline-block mb-8 text-left w-full">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-900">
                {formatDate(bookingData.available_slots.find(s => s._id === selectedSlotId)?.start || '')}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-700">
                {formatTime(bookingData.available_slots.find(s => s._id === selectedSlotId)?.start || '')} - {formatTime(bookingData.available_slots.find(s => s._id === selectedSlotId)?.end || '')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-700">Google Meet</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            You can safely close this page. Good luck with your interview!
          </p>
        </motion.div>
      </div>
    );
  }

  // Calendar rendering variables
  const daysInMonth = getDaysInMonth(currentMonthDate.getFullYear(), currentMonthDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonthDate.getFullYear(), currentMonthDate.getMonth());
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);
  const monthName = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule Your Interview
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
            Congratulations! You have been shortlisted. Please select your preferred date and time from the calendar below.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Top Banner / Details */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:p-10 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Position</p>
                  <p className="text-xl font-semibold">
                    {bookingData.job_title || "Role"}
                  </p>
                  <p className="text-blue-100 mt-1">{bookingData.booking?.employer_id?.company || "Company Name"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Candidate</p>
                  <p className="text-xl font-semibold">
                    {bookingData.candidate_name || "Candidate"} 
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calendar Section */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Calendar Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-lg">{monthName}</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={handleNextMonth} className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">{day}</div>
                ))}
                {blanksArray.map(b => <div key={`blank-${b}`} className="p-2"></div>)}
                {daysArray.map(day => {
                  const dateStr = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const hasSlots = !!groupedSlots[dateStr];
                  const isSelected = selectedDateStr === dateStr;
                  
                  return (
                    <button 
                      key={day}
                      onClick={() => {
                         if (hasSlots) {
                           setSelectedDateStr(dateStr);
                           setSelectedSlotId(null); // Reset specific time slot when date changes
                         }
                      }}
                      disabled={!hasSlots}
                      className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110' :
                        hasSlots ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer' :
                        'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slots List */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" /> 
                {selectedDateStr ? new Date(selectedDateStr + 'T00:00:00').toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
              </h3>

              {selectedDateStr && groupedSlots[selectedDateStr] ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {groupedSlots[selectedDateStr].map(slot => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlotId(slot._id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedSlotId === slot._id 
                          ? 'border-blue-600 bg-blue-50 text-blue-800' 
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-semibold">{formatTime(slot.start)}</span>
                      {selectedSlotId === slot._id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 text-slate-500 p-6 rounded-xl border border-slate-200 text-center">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p>Please select a highlighted date on the calendar to view available times.</p>
                </div>
              )}

              {/* Confirm Action */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={handleConfirmSlot}
                  disabled={selectedSlotId === null || isSubmitting} 
                  className={`py-4 px-6 rounded-xl font-bold text-white w-full flex items-center justify-center gap-2 transition-all shadow-lg ${
                    selectedSlotId === null || isSubmitting
                      ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500" 
                      : "bg-green-600 hover:bg-green-700 hover:shadow-green-600/25 hover:-translate-y-0.5 cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Confirming..." : "Confirm Selected Time"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
