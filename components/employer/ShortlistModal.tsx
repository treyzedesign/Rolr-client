"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, AlertCircle, UserCheck, Clock, Plus, Trash2 } from "lucide-react";
import type { InterviewSession } from "@/lib/api/interviews";
import toast from "react-hot-toast";

interface ShortlistModalProps {
  session: InterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slots: { start: string; end: string }[]) => Promise<void>;
}

// Helper to format Date to YYYY-MM-DD
const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type TimeBlock = {
  id: string;
  start: string;
  end: string;
};

export function ShortlistModal({ session, isOpen, onClose, onConfirm }: ShortlistModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { id: '1', start: '09:00', end: '09:30' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default range to tomorrow to next week
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 4);

      setStartDate(formatDateStr(tomorrow));
      setEndDate(formatDateStr(nextWeek));
      setTimeBlocks([
        { id: Math.random().toString(), start: '09:00', end: '09:30' }
      ]);
    }
  }, [isOpen]);

  if (!session) return null;

  const handleAddTimeBlock = () => {
    setTimeBlocks([
      ...timeBlocks,
      { id: Math.random().toString(), start: '10:00', end: '10:30' }
    ]);
  };

  const handleRemoveTimeBlock = (id: string) => {
    if (timeBlocks.length <= 1) {
      toast.error("You must have at least one time block.");
      return;
    }
    setTimeBlocks(timeBlocks.filter(tb => tb.id !== id));
  };

  const handleTimeBlockChange = (id: string, field: 'start' | 'end', value: string) => {
    setTimeBlocks(timeBlocks.map(tb => tb.id === id ? { ...tb, [field]: value } : tb));
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || timeBlocks.some(tb => !tb.start || !tb.end)) {
      toast.error("Please fill in all date and time fields.");
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const slots = [];
      const current = new Date(start);

      // Loop through each day from start date to end date
      while (current <= end) {
        // Loop through each defined time block for this day
        for (const block of timeBlocks) {
          // Construct Start Datetime for this day
          const [sh, sm] = block.start.split(':').map(Number);
          const slotStart = new Date(current);
          slotStart.setHours(sh, sm, 0, 0);
          
          // Construct End Datetime for this day
          const [eh, em] = block.end.split(':').map(Number);
          const slotEnd = new Date(current);
          slotEnd.setHours(eh, em, 0, 0);

          // Ensure time is valid
          if (slotEnd <= slotStart) {
            toast.error("End time must be after start time for all blocks.");
            setIsSubmitting(false);
            return;
          }

          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
        
        current.setDate(current.getDate() + 1);
      }

      await onConfirm(slots);
      onClose();
    } catch (error) {
      console.error("Shortlist execution failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate how many slots will be generated
  const daysCount = (startDate && endDate) 
    ? Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;
  
  const totalSlotsCount = daysCount * timeBlocks.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="border-b border-slate-200 p-6 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Shortlist Candidate</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Generate interview slots for{" "}
                    <span className="font-semibold text-blue-600">
                      {session.profile_id.first_name} {session.profile_id.last_name}
                    </span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* Information Callout */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                  <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-semibold">Bulk Slot Generation:</span> Select a date range and your daily time blocks. We will automatically generate all specific slots for each day.
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-6">
                  {/* Date Range Form */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-600" /> Date Range
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Daily Time Blocks */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-t border-slate-200 pt-5">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" /> Daily Time Blocks
                      </h4>
                      <button 
                        onClick={handleAddTimeBlock}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Block
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {timeBlocks.map((block, index) => (
                        <div key={block.id} className="flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <input
                                type="time"
                                value={block.start}
                                onChange={(e) => handleTimeBlockChange(block.id, 'start', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                              />
                            </div>
                            <div>
                              <input
                                type="time"
                                value={block.end}
                                onChange={(e) => handleTimeBlockChange(block.id, 'end', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveTimeBlock(block.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove time block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview summary */}
                {totalSlotsCount > 0 && (
                  <div className="text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Generating <span className="font-bold text-green-900">{timeBlocks.length} block{timeBlocks.length > 1 ? 's' : ''}</span> per day over <span className="font-bold text-green-900">{daysCount} day{daysCount > 1 ? 's' : ''}</span>. 
                      Total: <span className="font-bold text-green-900">{totalSlotsCount} slot{totalSlotsCount > 1 ? 's' : ''}</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-6 flex justify-end gap-3 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 text-sm font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!startDate || !endDate || isSubmitting || totalSlotsCount < 1}
                  className={`px-5 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all ${
                    !startDate || !endDate || isSubmitting || totalSlotsCount < 1
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/10 cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Processing..." : "Generate Slots & Shortlist"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
