"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useEmployerStore } from "@/stores/employer-store";
import type { Candidate } from "@/types/employer";

export default function CandidateDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getCandidateById } = useEmployerStore();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id;
    if (!id) {
      setLoading(false);
      return;
    }
    void getCandidateById(id).then((data) => {
      setCandidate(data);
      setLoading(false);
    });
  }, [getCandidateById, params.id]);

  if (loading) {
    return <div className="p-10 text-slate-700">Loading candidate details...</div>;
  }

  if (!candidate) {
    return (
      <div className="p-10 text-slate-700">
        Candidate not found.{" "}
        <Link className="text-sky-300 underline" href="/employer/discover">
          Back to discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-grid-futuristic min-h-[calc(100vh-8rem)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">{candidate.fullName}</h1>
            <p className="mt-1 text-blue-700">{candidate.title}</p>
            <p className="text-sm text-slate-600">{candidate.location}</p>
          </div>
          <Link
            href="/employer/discover"
            className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-blue-50"
          >
            Back
          </Link>
        </div>
        <p className="mt-6 text-slate-700">{candidate.bio}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Experience</dt>
            <dd className="mt-1 text-slate-900">{candidate.yearsExperience} years</dd>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Salary</dt>
            <dd className="mt-1 text-slate-900">{candidate.expectedSalary}</dd>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Availability</dt>
            <dd className="mt-1 text-slate-900">{candidate.availability}</dd>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Education</dt>
            <dd className="mt-1 text-slate-900">{candidate.education ?? "Not provided"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
