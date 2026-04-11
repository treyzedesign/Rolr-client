"use client";

import Link from "next/link";
import { type PointerEventHandler, useMemo, useState } from "react";
import type { Job } from "@/types/candidate";

interface JobSwipeBoardProps {
  jobs: Job[];
  onSwipe: (jobId: string, accepted: boolean) => void;
}

export function JobSwipeBoard({ jobs, onSwipe }: JobSwipeBoardProps) {
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const topJob = useMemo(() => jobs[0], [jobs]);

  if (!topJob) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
        No more jobs matching your current preferences.
      </div>
    );
  }

  const onPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    setDragStartY(event.clientY);
  };

  const onPointerUp: PointerEventHandler<HTMLElement> = (event) => {
    if (dragStartY === null) {
      return;
    }
    const delta = event.clientY - dragStartY;
    if (delta < -55) {
      onSwipe(topJob.id, true);
    } else if (delta > 55) {
      onSwipe(topJob.id, false);
    }
    setDragStartY(null);
  };

  return (
    <article
      className="relative rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-6 shadow-[0_20px_70px_-35px_rgba(59,130,246,0.35)]"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Swipe card</p>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
          {jobs.length} left
        </span>
      </div>
      
      <div className="rounded-2xl border border-blue-100 bg-white p-5">
        <div className="mb-4">
          <h3 className="font-display text-2xl font-semibold text-slate-900">{topJob.title}</h3>
          <p className="mt-1 text-lg font-medium text-blue-700">{topJob.companyName}</p>
          <p className="mt-2 text-sm text-slate-600">{topJob.location}</p>
        </div>
        
        <div className="mb-4">
          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {topJob.salaryRange}
          </span>
          <span className="ml-2 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {topJob.employmentType.replace('_', ' ')}
          </span>
        </div>

        <p className="mb-4 text-sm text-slate-700">{topJob.description}</p>
        
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Requirements:</h4>
          <ul className="space-y-1">
            {topJob.requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-blue-400"></span>
                {req}
              </li>
            ))}
            {topJob.requirements.length > 3 && (
              <li className="text-sm text-slate-500">
                +{topJob.requirements.length - 3} more requirements
              </li>
            )}
          </ul>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {topJob.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-slate-700"
            >
              {skill}
            </span>
          ))}
          {topJob.skills.length > 4 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
              +{topJob.skills.length - 4} more
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSwipe(topJob.id, false)}
          className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          Swipe down decline
        </button>
        <Link
          href={`/candidate/jobs/${topJob.id}`}
          className="rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
        >
          View full details
        </Link>
        <button
          type="button"
          onClick={() => onSwipe(topJob.id, true)}
          className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Swipe up apply
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-600">
        Gesture enabled: drag up to apply, drag down to decline.
      </p>
    </article>
  );
}
