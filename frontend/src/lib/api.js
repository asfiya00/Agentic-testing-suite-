import { io } from "socket.io-client";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const socket = io(API_URL, { autoConnect: true });

export async function fetchScans() {
  const res = await fetch(`${API_URL}/api/scans`);
  if (!res.ok) throw new Error("Failed to load scans");
  return res.json();
}

export async function fetchScanById(id) {
  const res = await fetch(`${API_URL}/api/scans/${id}`);
  if (!res.ok) throw new Error("Failed to load scan");
  return res.json();
}

export async function startScan({ repoUrl, liveUrl, maxPages }) {
  const res = await fetch(`${API_URL}/api/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl, liveUrl, maxPages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start scan");
  return data;
}
export async function askChatbot(message) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed");
  return data.reply;
}