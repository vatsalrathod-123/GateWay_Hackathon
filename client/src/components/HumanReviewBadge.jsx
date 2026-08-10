// import React from 'react';
import { UserCheck, ShieldAlert } from "lucide-react";

const HumanReviewBadge = ({ needsHuman, notes = [] }) => {
  if (!needsHuman) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
        <UserCheck className="w-3 h-3" /> Auto-Resolved
      </span>
    );
  }

  return (
    <div className="group relative inline-block">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 cursor-help">
        <ShieldAlert className="w-3 h-3 text-rose-400" /> HUMAN REVIEW REQUIRED
      </span>
      {notes && notes.length > 0 && (
        <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 z-50 pointer-events-none">
          <p className="font-semibold text-rose-400 mb-1">
            Escalation Trigger:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HumanReviewBadge;
