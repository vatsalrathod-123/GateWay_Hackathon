import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

export const processSingleMessage = async (text, id = null) => {
  const res = await api.post("/triage", { id, text });
  return res.data;
};

export const processBatchMessages = async (messages) => {
  const res = await api.post("/triage/batch", { messages });
  return res.data;
};

export const fetchResults = async () => {
  const res = await api.get("/triage/results");
  return res.data;
};

export const clearResults = async () => {
  const res = await api.delete("/triage/results");
  return res.data;
};
