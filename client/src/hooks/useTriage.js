import { useState, useEffect, useCallback } from "react";
import {
  processSingleMessage,
  processBatchMessages,
  fetchResults,
  clearResults,
} from "../services/api";

export const useTriage = () => {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterHumanOnly, setFilterHumanOnly] = useState(false);

  const loadHistoricalResults = useCallback(async () => {
    try {
      const response = await fetchResults();
      if (response.success && Array.isArray(response.data)) {
        setResults(response.data);
      }
    } catch (err) {
      console.error("Failed to load historical triage results:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistoricalResults();
  }, [loadHistoricalResults]);

  const triageSingle = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const output = await processSingleMessage(text);
      await loadHistoricalResults();
      setLoading(false);
      return output;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to triage message");
      setLoading(false);
      throw err;
    }
  };

  const triageBatch = async (messagesArray) => {
    setLoading(true);
    setError(null);
    try {
      const output = await processBatchMessages(messagesArray);
      if (output.summary) setSummary(output.summary);
      await loadHistoricalResults();
      setLoading(false);
      return output;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process batch triage");
      setLoading(false);
      throw err;
    }
  };

  const handleClearHistory = async () => {
    await clearResults();
    setResults([]);
    setSummary(null);
  };

  const filteredResults = results.filter((item) => {
    const matchCat =
      filterCategory === "ALL" || item.category === filterCategory;
    const matchHuman = !filterHumanOnly || item.needs_human === true;
    return matchCat && matchHuman;
  });

  return {
    results: filteredResults,
    rawResults: results,
    summary,
    loading,
    error,
    triageSingle,
    triageBatch,
    handleClearHistory,
    filterCategory,
    setFilterCategory,
    filterHumanOnly,
    setFilterHumanOnly,
    refresh: loadHistoricalResults,
  };
};
