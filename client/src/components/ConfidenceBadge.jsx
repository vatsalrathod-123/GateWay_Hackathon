// import React from "react";

const ConfidenceBadge = ({ confidence }) => {
  const score = Math.round((confidence || 0) * 100);

  let colorClass = "bg-emerald-950 text-emerald-300 border-emerald-800";
  if (score < 70) colorClass = "bg-rose-950 text-rose-300 border-rose-800";
  else if (score < 85)
    colorClass = "bg-amber-950 text-amber-300 border-amber-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClass}`}
    >
      {score}%
    </span>
  );
};

export default ConfidenceBadge;
