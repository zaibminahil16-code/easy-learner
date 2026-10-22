import axios from "axios";

const BASE = "http://localhost:5000";

export async function generateTrace(prompt) {
  const res = await axios.post(`${BASE}/generate`, { prompt });
  return res.data;
}

export async function executeCode(code) {
  const res = await axios.post(`${BASE}/execute`, { code });
  return res.data;
}