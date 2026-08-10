import React, { useState } from "react";
import PriorityBadge from "./PriorityBadge";
import ConfidenceBadge from "./ConfidenceBadge";
import HumanReviewBadge from "./HumanReviewBadge";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

const MessageTable = ({
  results,
  filterCategory,
  setFilterCategory,
  filterHumanOnly,
  setFilterHumanOnly,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  const categories = [
    "ALL",
    "billing",
    "technical_support",
    "account_access",
    "order_issue",
    "refund",
    "complaint",
    "feature_request",
    "general_question",
    "security",
    "out_of_scope",
    "other",
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Filter Header */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400">
            Category Filter:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterHumanOnly}
            onChange={(e) => setFilterHumanOnly(e.target.checked)}
            className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
          />
          <span>Show Human Review Required Only</span>
        </label>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
              <th className="p-3.5 w-8"></th>
              <th className="p-3.5">MESSAGE / SUMMARY</th>
              <th className="p-3.5">CATEGORY</th>
              <th className="p-3.5">PRIORITY</th>
              <th className="p-3.5">CONFIDENCE</th>
              <th className="p-3.5">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {results.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No triage records found. Run a single message or batch sample
                  dataset above.
                </td>
              </tr>
            ) : (
              results.map((item, idx) => {
                const isExpanded = expandedId === (item.messageId || idx);
                return (
                  <React.Fragment key={item.messageId || idx}>
                    <tr
                      onClick={() => toggleExpand(item.messageId || idx)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="p-3.5 max-w-md">
                        <p className="font-medium text-slate-200 truncate">
                          {item.summary || item.rawText}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">
                          {item.rawText}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="p-3.5">
                        <ConfidenceBadge confidence={item.confidence} />
                      </td>
                      <td className="p-3.5">
                        <HumanReviewBadge
                          needsHuman={item.needs_human}
                          notes={item.guardrail_notes}
                        />
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td
                          colSpan="6"
                          className="p-5 border-t border-b border-slate-800"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Raw Customer Input
                              </p>
                              <div className="p-3 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs font-mono whitespace-pre-wrap">
                                {item.rawText}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                                Suggested Agent Action
                              </p>
                              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded text-indigo-200 text-xs">
                                {item.suggested_action}
                              </div>
                            </div>
                          </div>

                          {item.guardrail_notes &&
                            item.guardrail_notes.length > 0 && (
                              <div className="mt-3 p-3 bg-rose-950/20 border border-rose-900/40 rounded flex items-start gap-2 text-rose-300 text-xs">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold">
                                    Guardrail Escalation Reason:
                                  </span>
                                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                    {item.guardrail_notes.map((note, i) => (
                                      <li key={i}>{note}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessageTable;
