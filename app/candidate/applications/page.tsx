export default function CandidateApplications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          My Applications
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Track the status of your job applications and employer responses.
        </p>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Applied</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">12</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-amber-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Review</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">5</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-emerald-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Interviews</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">3</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-xl border border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="p-6 border-b border-blue-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Applications</h3>
        </div>
        
        <div className="divide-y divide-blue-100 dark:divide-slate-800">
          {/* Application 1 */}
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Senior Frontend Developer</h4>
                <p className="text-sm text-blue-700 dark:text-sky-300">TechCorp Solutions</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Applied 2 days ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  In Review
                </span>
              </div>
            </div>
          </div>
          
          {/* Application 2 */}
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Backend Engineer</h4>
                <p className="text-sm text-blue-700 dark:text-sky-300">FinTech Africa</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Applied 1 week ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                  Interview Scheduled
                </span>
              </div>
            </div>
          </div>
          
          {/* Application 3 */}
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Product Designer</h4>
                <p className="text-sm text-blue-700 dark:text-sky-300">Design Studio Pro</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Applied 2 weeks ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Not Selected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
