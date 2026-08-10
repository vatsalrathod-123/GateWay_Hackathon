// import React from "react";
import { ShieldAlert, Activity, RefreshCw } from "lucide-react";

const Navbar = ({ onRefresh, onClear }) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/50">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-white">
            FRONTLINE AI ENGINE v1.0
          </h1>

          <p className="text-xs text-slate-500">
            Autonomous Customer Support Triage & Safety Escalation
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* AI Status */}
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Gemini 3.6 Flash Active</span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Clear Memory */}
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded border border-slate-700 hover:border-rose-900/50 transition-colors"
        >
          Clear Memory
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
