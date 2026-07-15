"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, AlertCircle, UserCheck, Clock, Plus, Trash2, Loader2 } from "lucide-react";
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

      while (current <= end) {
        for (const block of timeBlocks) {
          const [sh, sm] = block.start.split(':').map(Number);
          const slotStart = new Date(current);
          slotStart.setHours(sh, sm, 0, 0);
          
          const [eh, em] = block.end.split(':').map(Number);
          const slotEnd = new Date(current);
          slotEnd.setHours(eh, em, 0, 0);

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

  const daysCount = (startDate && endDate) 
    ? Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;
  
  const totalSlotsCount = daysCount * timeBlocks.length;
  const candName = `${session.profile_id?.first_name || "Helen"} ${session.profile_id?.last_name || "Coker"}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] select-none relative"
            >
              
              {/* Close Button top right */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors border-none bg-transparent cursor-pointer z-20"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {/* Scrollable Content Container */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                
                {/* Header Title Section */}
                <div>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">
                    Shortlist Candidate
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mt-1">
                    Generate interview slots for{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {candName}
                    </span>
                  </p>
                </div>

                {/* Bulk Slot Generation Informational Callout */}
                <div className="bg-blue-50/50 dark:bg-blue-955/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-blue-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Bulk Slot Generation:</span> Select a date range and your daily time blocks. We will automatically generate all specific slots for each day.
                  </div>
                </div>

                {/* Main Form Fields */}
                <div className="space-y-6">
                  
                  {/* Start Date & End Date Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer pr-10"
                        />
                        <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer pr-10"
                        />
                        <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Daily Time Blocks Dynamic Form Rows */}
                  <div className="space-y-4 pt-2">
                    {timeBlocks.map((block, index) => (
                      <div key={block.id} className="relative group">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                              Start Time Block {timeBlocks.length > 1 ? `#${index + 1}` : ""}
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={block.start}
                                onChange={(e) => handleTimeBlockChange(block.id, 'start', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer pr-10"
                              />
                              <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                              End Time Block {timeBlocks.length > 1 ? `#${index + 1}` : ""}
                            </label>
                            <div className="relative flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="time"
                                  value={block.end}
                                  onChange={(e) => handleTimeBlockChange(block.id, 'end', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer pr-10"
                                />
                                <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                              </div>
                              {timeBlocks.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveTimeBlock(block.id)}
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                  title="Remove time block"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Block button */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddTimeBlock}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors border-none bg-transparent cursor-pointer select-none"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add More</span>
                    </button>
                  </div>

                </div>

                {/* Preview summary hint box */}
                {totalSlotsCount > 0 && (
                  <div className="text-center px-4.5 py-3 bg-green-50/50 dark:bg-green-955/20 border border-green-150 dark:border-green-900/30 rounded-2xl">
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                      Generating <span className="font-bold text-green-900 dark:text-green-200">{timeBlocks.length} block{timeBlocks.length > 1 ? 's' : ''}</span> per day over <span className="font-bold text-green-900 dark:text-green-200">{daysCount} day{daysCount > 1 ? 's' : ''}</span>. 
                      Total: <span className="font-bold text-green-900 dark:text-green-200">{totalSlotsCount} slot{totalSlotsCount > 1 ? 's' : ''}</span>.
                    </p>
                  </div>
                )}

                {/* Full-Width shortlist button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!startDate || !endDate || isSubmitting || totalSlotsCount < 1}
                    className={`w-full py-3 rounded-full text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 select-none border-none ${
                      !startDate || !endDate || isSubmitting || totalSlotsCount < 1
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Processing..." : "Shortlist"}
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
