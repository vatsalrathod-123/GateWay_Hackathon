// import React from "react";
import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import UploadPanel from "./components/UploadPanel";
import MessageTable from "./components/MessageTable";
import { useTriage } from "./hooks/useTriage";
import { MessageSquare, ShieldAlert, CheckCircle, Zap } from "lucide-react";

function App() {
  const {
    results,
    rawResults,
    loading,
    error,
    triageSingle,
    triageBatch,
    handleClearHistory,
    filterCategory,
    setFilterCategory,
    filterHumanOnly,
    setFilterHumanOnly,
    refresh,
  } = useTriage();

  // Calculate live stats
  const totalCount = rawResults.length;
  const humanReviewCount = rawResults.filter((r) => r.needs_human).length;
  const autoResolvedCount = totalCount - humanReviewCount;
  const avgConfidence =
    totalCount > 0
      ? Math.round(
          (rawResults.reduce((acc, curr) => acc + (curr.confidence || 0), 0) /
            totalCount) *
            100,
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onRefresh={refresh} onClear={handleClearHistory} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={refresh} className="underline text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Processed"
            value={totalCount}
            icon={MessageSquare}
            color="indigo"
            subtitle="Current session messages"
          />
          <StatsCard
            title="Auto-Resolved"
            value={autoResolvedCount}
            icon={CheckCircle}
            color="emerald"
            subtitle={`${totalCount > 0 ? Math.round((autoResolvedCount / totalCount) * 100) : 0}% automation rate`}
          />
          <StatsCard
            title="Human Escalations"
            value={humanReviewCount}
            icon={ShieldAlert}
            color="rose"
            subtitle="Flagged by guardrails"
          />
          <StatsCard
            title="Avg AI Confidence"
            value={`${avgConfidence}%`}
            icon={Zap}
            color="purple"
            subtitle="Model accuracy rating"
          />
        </div>

        {/* Console Panel */}
        <UploadPanel
          onSingleSubmit={triageSingle}
          onBatchSubmit={triageBatch}
          loading={loading}
        />

        {/* Table View */}
        <MessageTable
          results={results}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterHumanOnly={filterHumanOnly}
          setFilterHumanOnly={setFilterHumanOnly}
        />
      </main>
    </div>
  );
}

export default App;
