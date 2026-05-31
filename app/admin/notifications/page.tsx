"use client";

import { useState } from "react";
import { Search, Filter, Bell, Send, CheckCircle2, Clock, Megaphone, Info, AlertTriangle } from "lucide-react";

const DUMMY_NOTIFICATIONS = [
  { id: 1, title: "System Maintenance", message: "Scheduled maintenance will occur on Sunday at 2 AM EST.", type: "alert", audience: "all", status: "sent", date: "2026-05-17 10:00 AM" },
  { id: 2, title: "New Feature: Video Interviews", message: "You can now schedule video interviews directly through WorkSwipe!", type: "announcement", audience: "employers", status: "sent", date: "2026-05-16 02:30 PM" },
  { id: 3, title: "Profile Completion Reminder", message: "Complete your profile to increase your match rate by 50%.", type: "info", audience: "job_seekers", status: "scheduled", date: "2026-05-18 09:00 AM" },
  { id: 4, title: "Account Security Update", message: "We've updated our password policy. Please review.", type: "alert", audience: "all", status: "draft", date: "N/A" },
];

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredNotifications = DUMMY_NOTIFICATIONS.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(search.toLowerCase()) || notif.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || notif.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-purple-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Push Notifications</h1>
          <p className="text-slate-400">Manage and send platform-wide announcements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/25">
          <Send className="w-4 h-4" /> New Broadcast
        </button>
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
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm transition-all"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm appearance-none transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Drafts</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Notification Details</th>
                <th className="px-6 py-4 font-medium">Audience</th>
                <th className="px-6 py-4 font-medium">Date/Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white mb-1">No notifications found</p>
                    <p>Try adjusting your filters or create a new broadcast.</p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                          {getIconForType(notif.type)}
                        </div>
                        <div>
                          <div className="font-medium text-white mb-1">{notif.title}</div>
                          <div className="text-sm text-slate-400 line-clamp-1">{notif.message}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {notif.audience.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" /> {notif.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        notif.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        notif.status === 'draft' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        <span className="capitalize flex items-center gap-1">
                          {notif.status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
                          {notif.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 text-sm font-medium text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
