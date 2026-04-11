"use client";

import Link from "next/link";
import { type PointerEventHandler, useMemo, useState } from "react";
import type { Candidate } from "@/types/employer";

interface CandidateSwipeBoardProps {
  candidates: Candidate[];
  onSwipe: (candidateId: string, accepted: boolean) => void;
}

export function CandidateSwipeBoard({ candidates, onSwipe }: CandidateSwipeBoardProps) {
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const topCandidate = useMemo(() => candidates[0], [candidates]);

  if (!topCandidate) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-600">
        No more candidates for your current preference set.
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
      onSwipe(topCandidate.id, true);
    } else if (delta > 55) {
      onSwipe(topCandidate.id, false);
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
          {candidates.length} left
        </span>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-white p-5">
        <h3 className="font-display text-2xl font-semibold text-slate-900">{topCandidate.fullName}</h3>
        <p className="mt-1 text-blue-700">{topCandidate.title}</p>
        <p className="mt-3 text-sm text-slate-600">{topCandidate.location}</p>
        <p className="mt-4 text-sm text-slate-700">{topCandidate.bio}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {topCandidate.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSwipe(topCandidate.id, false)}
          className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          Swipe down decline
        </button>
        <Link
          href={`/employer/candidates/${topCandidate.id}`}
          className="rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
        >
          View full details
        </Link>
        <button
          type="button"
          onClick={() => onSwipe(topCandidate.id, true)}
          className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Swipe up accept
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-600">
        Gesture enabled: drag up to accept, drag down to decline.
      </p>
    </article>
  );
}
