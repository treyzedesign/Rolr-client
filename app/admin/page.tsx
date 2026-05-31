"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  RefreshCw,
  BarChart3,
  FileText
} from "lucide-react";
import { getAdminStats, AdminStatsResponse } from "@/lib/api/admin";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<AdminStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "12m">("30d");

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminStats(period);
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const chartData = useMemo(() => {
    if (!statsData?.time_series) return [];
    
    const dateSet = new Set<string>();
    const { users, jobs, applications, matches, interviews } = statsData.time_series;
    
    [users, jobs, applications, matches, interviews].forEach(arr => {
      arr?.forEach(item => dateSet.add(item.date));
    });

    const dates = Array.from(dateSet).sort();
    
    return dates.map(date => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        originalDate: date,
        Users: users?.find(u => u.date === date)?.count || 0,
        Jobs: jobs?.find(j => j.date === date)?.count || 0,
        Applications: applications?.find(a => a.date === date)?.count || 0,
        Matches: matches?.find(m => m.date === date)?.count || 0,
        Interviews: interviews?.find(i => i.date === date)?.count || 0,
      };
    });
  }, [statsData]);

  // Transform KPIs to match the previous stats format
  const stats = useMemo(() => {
    if (!statsData) return [];
    
    return [
      {
        name: "Total Users",
        value: statsData.kpis.users.total.toLocaleString(),
        change: `${statsData.kpis.users.pct_change >= 0 ? '+' : ''}${statsData.kpis.users.pct_change.toFixed(1)}%`,
        trend: statsData.kpis.users.pct_change >= 0 ? "up" : "down",
        icon: Users,
        color: "cyan",
      },
      {
        name: "Active Jobs",
        value: statsData.kpis.jobs.active.toLocaleString(),
        change: `${statsData.kpis.jobs.pct_change >= 0 ? '+' : ''}${statsData.kpis.jobs.pct_change.toFixed(1)}%`,
        trend: statsData.kpis.jobs.pct_change >= 0 ? "up" : "down",
        icon: Briefcase,
        color: "blue",
      },
      {
        name: "Total Applications",
        value: statsData.kpis.applications.total.toLocaleString(),
        change: `${statsData.kpis.applications.pct_change >= 0 ? '+' : ''}${statsData.kpis.applications.pct_change.toFixed(1)}%`,
        trend: statsData.kpis.applications.pct_change >= 0 ? "up" : "down",
        icon: FileText,
        color: "purple",
      },
      {
        name: "Successful Matches",
        value: statsData.kpis.matches.total.toLocaleString(),
        change: `${statsData.kpis.matches.pct_change >= 0 ? '+' : ''}${statsData.kpis.matches.pct_change.toFixed(1)}%`,
        trend: statsData.kpis.matches.pct_change >= 0 ? "up" : "down",
        icon: CheckCircle,
        color: "green",
      },
    ];
  }, [statsData]);

  const breakdownData = useMemo(() => {
    if (!statsData) return [];
    
    return [
      { name: "Seekers", value: statsData.breakdowns?.users_by_role?.job_seeker || 0, fill: "#06b6d4" },
      { name: "Employers", value: statsData.breakdowns?.users_by_role?.employer || 0, fill: "#3b82f6" },
      { name: "Jobs", value: statsData.kpis?.jobs?.total || 0, fill: "#a855f7" },
      { name: "Applications", value: statsData.kpis?.applications?.total || 0, fill: "#f59e0b" },
      { name: "Matches", value: statsData.kpis?.matches?.total || 0, fill: "#10b981" },
      { name: "Interviews", value: statsData.kpis?.interviews?.total || 0, fill: "#ec4899" },
    ];
  }, [statsData]);

  const quickActions = [
    {
      name: "Manage Users",
      description: "View and manage all platform users",
      icon: Users,
      href: "/admin/users",
      color: "from-cyan-500 to-blue-600",
    },
    {
      name: "Review Jobs",
      description: "Moderate and manage job postings",
      icon: Briefcase,
      href: "/admin/jobs",
      color: "from-purple-500 to-pink-600",
    },
    {
      name: "View Analytics",
      description: "Detailed platform analytics",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "System Settings",
      description: "Configure platform settings",
      icon: Activity,
      href: "/admin/settings",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening on WorkSwipe today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="block w-36 pl-3 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm appearance-none transition-all"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button 
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading && !statsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 h-32 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.name}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  stat.color === 'cyan' ? 'from-cyan-500/20 to-blue-500/20' :
                  stat.color === 'blue' ? 'from-blue-500/20 to-indigo-500/20' :
                  stat.color === 'green' ? 'from-green-500/20 to-emerald-500/20' :
                  'from-purple-500/20 to-pink-500/20'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'cyan' ? 'text-cyan-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" /> Platform Growth ({period})
        </h2>
        
        {isLoading && !statsData ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Users" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Jobs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Applications" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Matches" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center flex-col text-slate-500">
            <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
            <p>No activity data available for the selected period.</p>
          </div>
        )}
      </div>

      {/* Breakdowns & Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> Platform Breakdowns
          </h2>
          
          {isLoading && !statsData ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : breakdownData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 12, color: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 12, color: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 500, color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center flex-col text-slate-500">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p>No breakdown data available.</p>
            </div>
          )}
        </div>

        {/* Top Jobs */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Top Jobs by Applications</h2>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : statsData?.top_jobs_by_applications && statsData.top_jobs_by_applications.length > 0 ? (
            <div className="space-y-4">
              {statsData.top_jobs_by_applications.map((job) => (
                <div 
                  key={job.job_id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800"
                >
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">ID: {job.job_id.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">{job.count}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Applicants</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No applications data available.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 shadow-lg inline-block group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">{action.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
