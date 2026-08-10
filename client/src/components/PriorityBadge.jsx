// import React from "react";

const PriorityBadge = ({ priority }) => {
  const styles = {
    P0: "bg-rose-950 text-rose-300 border-rose-800 animate-pulse",
    P1: "bg-amber-950 text-amber-300 border-amber-800",
    P2: "bg-blue-950 text-blue-300 border-blue-800",
    P3: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const labels = {
    P0: "P0 - CRITICAL",
    P1: "P1 - HIGH",
    P2: "P2 - NORMAL",
    P3: "P3 - LOW",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${styles[priority] || styles.P2}`}
    >
      {labels[priority] || priority}
    </span>
  );
};

export default PriorityBadge;
