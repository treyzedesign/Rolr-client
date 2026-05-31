"use client";

import { useState } from "react";
import { Heart, Search, Filter, Calendar, Building, MapPin, ArrowUpDown, ChevronLeft, ChevronRight, User } from "lucide-react";

const DUMMY_MATCHES = [
  { id: 1, candidate: "Sarah Johnson", employer: "Tech Corp", job: "Senior Frontend Engineer", status: "active", date: "2026-05-16", score: 95 },
  { id: 2, candidate: "Mike Wilson", employer: "Design Studio", job: "UI/UX Designer", status: "pending", date: "2026-05-15", score: 88 },
  { id: 3, candidate: "Emily Brown", employer: "Global Logistics", job: "Project Manager", status: "rejected", date: "2026-05-14", score: 72 },
  { id: 4, candidate: "David Lee", employer: "FinTech Solutions", job: "Backend Developer", status: "active", date: "2026-05-14", score: 91 },
  { id: 5, candidate: "Alex Turner", employer: "Marketing Agency", job: "Content Strategist", status: "active", date: "2026-05-13", score: 85 },
];

export default function AdminMatchesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredMatches = DUMMY_MATCHES.filter(match => {
    const matchesSearch = match.candidate.toLowerCase().includes(search.toLowerCase()) || match.employer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || match.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Match Management</h1>
          <p className="text-slate-400">Monitor and manage platform job matches</p>
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
              placeholder="Search matches..."
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
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
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Employer & Job</th>
                <th className="px-6 py-4 font-medium">Match Score</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white mb-1">No matches found</p>
                    <p>Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="font-medium text-white">{match.candidate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{match.job}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5" /> {match.employer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        {match.score}% Match
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(match.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        match.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        match.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        <span className="capitalize">{match.status}</span>
                      </span>
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
      </div>
    </div>
  );
}
