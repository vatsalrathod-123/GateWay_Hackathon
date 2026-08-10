// import React from "react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
  subtitle,
}) => {
  const colorMap = {
    indigo: "bg-indigo-950/40 border-indigo-800/50 text-indigo-400",
    emerald: "bg-emerald-950/40 border-emerald-800/50 text-emerald-400",
    amber: "bg-amber-950/40 border-amber-800/50 text-amber-400",
    purple: "bg-purple-950/40 border-purple-800/50 text-purple-400",
    rose: "bg-rose-950/40 border-rose-800/50 text-rose-400",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`p-2 rounded-lg border ${colorMap[color] || colorMap.indigo}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white tracking-tight">
          {value}
        </span>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
