"use client";

import { useState, useEffect, useMemo } from "react";
import { matchesApi } from "@/lib/api/matches";
import type { MatchedCandidate } from "@/lib/api/matches";
import { Heart, Briefcase, MapPin, Users, Clock, Loader2, Filter, Search } from "lucide-react";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");

  // Fetch matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await matchesApi.getMatchedCandidates(1, 50); // Get more for better grouping
        console.log("API Response:", response); // Debug log
        setMatches(response.matchedCandidates || []);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setError("Failed to load your matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Group matches by job
  const groupedMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    
    const grouped = matches.reduce((acc, match) => {
      const jobKey = match.job._id;
      if (!acc[jobKey]) {
        acc[jobKey] = {
          job: match.job,
          candidates: []
        };
      }
      acc[jobKey].candidates.push(match);
      return acc;
    }, {} as Record<string, { job: MatchedCandidate['job']; candidates: MatchedCandidate[] }>);

    return Object.values(grouped);
  }, [matches]);

  // Filter matches based on search and job selection
  const filteredGroupedMatches = useMemo(() => {
    return groupedMatches.filter(group => {
      const jobMatches = selectedJob === "all" || group.job._id === selectedJob;
      const searchMatches = searchTerm === "" || 
        group.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.candidates.some(candidate => 
          `${candidate.candidate.profile.first_name} ${candidate.candidate.profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return jobMatches && searchMatches;
    });
  }, [groupedMatches, selectedJob, searchTerm]);

  // Get unique jobs for filter dropdown
  const uniqueJobs = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    
    const jobs = Array.from(new Set(matches.map(match => JSON.stringify(match.job))))
      .map(jobStr => JSON.parse(jobStr));
    return jobs;
  }, [matches]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Matches</h1>
          <p className="text-slate-600">
            Candidates who have matched with your job postings
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Matches</p>
                <p className="text-2xl font-bold text-slate-900">{matches?.length || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Jobs with Matches</p>
                <p className="text-2xl font-bold text-slate-900">{groupedMatches.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg. Candidates per Job</p>
                <p className="text-2xl font-bold text-slate-900">
                  {groupedMatches.length > 0 && matches ? Math.round(matches.length / groupedMatches.length) : 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-slate-900">
                  {matches?.filter(match => {
                    const matchDate = new Date(match.match.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return matchDate >= weekAgo;
                  }).length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by job title or candidate name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Jobs</option>
                {uniqueJobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Matches Content */}
        {filteredGroupedMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || selectedJob !== "all" ? "No matches found" : "No matches yet"}
            </h3>
            <p className="text-slate-600">
              {searchTerm || selectedJob !== "all" 
                ? "Try adjusting your filters or search terms"
                : "Start swiping on candidates to see your matches here"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredGroupedMatches.map((group) => (
              <div key={group.job._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Job Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{group.job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {group.job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {group.job.job_type.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.candidates.length} candidates
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {group.candidates.length} matches
                    </div>
                  </div>
                </div>

                {/* Candidates Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.candidates.map((match) => {
                      const profile = match.candidate.profile;
                      return (
                        <div
                          key={`${match.job._id}-${match.candidate._id}`}
                          className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            {profile?.profile_image_url ? (
                              <img
                                src={profile.profile_image_url}
                                alt={`${profile.first_name} ${profile.last_name}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {profile?.first_name?.[0] || 'U'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">
                                {profile?.first_name} {profile?.last_name}
                              </h4>
                              {profile?.location && (
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {profile.location}
                                </p>
                              )}
                              {profile?.experience_level && (
                                <p className="text-sm text-slate-600">
                                  {profile.experience_level} level
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {profile?.bio && (
                            <p className="mt-3 text-sm text-slate-700 line-clamp-2">
                              {profile.bio}
                            </p>
                          )}
                          
                          {profile?.skills && profile.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {profile.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {profile.skills.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                  +{profile.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Matched {new Date(match.match.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              Match
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
