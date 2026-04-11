"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CandidateSwipeBoard } from "@/components/employer/CandidateSwipeBoard";
import { useAuthStore } from "@/stores/auth-store";
import { useEmployerStore } from "@/stores/employer-store";

export default function EmployerDiscoverPage() {
  const { user, logout } = useAuthStore();
  const { candidates, isLoadingCandidates, error, loadCandidates, swipeCandidate } =
    useEmployerStore();

  useEffect(() => {
    void loadCandidates({ page: 1, limit: 20 });
  }, [loadCandidates]);

  return (
    <div className="bg-grid-futuristic min-h-[calc(100vh-8rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Employer console</p>
            <h1 className="font-display mt-1 text-3xl font-bold text-slate-900">
              Candidate discovery
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome {user?.fullName ?? user?.email ?? "Employer"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/employer/profile"
              className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
            >
              Edit preferences
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
            >
              Sign out
            </button>
          </div>
        </header>

        {isLoadingCandidates ? (
          <p className="text-slate-600">Loading matching candidates...</p>
        ) : (
          <div className="mx-auto max-w-xl">
            <CandidateSwipeBoard
              candidates={candidates}
              onSwipe={(candidateId, accepted) => {
                void swipeCandidate(candidateId, accepted);
              }}
            />
          </div>
        )}
        {error ? <p className="mt-4 text-center text-sm text-amber-300">{error}</p> : null}
      </div>
    </div>
  );
}
