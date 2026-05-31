"use client";

import { Shield } from "lucide-react";

export default function AdminSecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
        <p className="text-slate-400">Configure platform security settings</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
        <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Security Settings</h2>
        <p className="text-slate-400">This page is under construction. Check back soon!</p>
      </div>
    </div>
  );
}
