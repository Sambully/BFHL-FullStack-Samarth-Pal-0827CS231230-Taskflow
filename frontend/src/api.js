import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const getTasks = (params = {}) => api.get("/bfhl/tasks", { params });
export const getStats = () => api.get("/bfhl/tasks/stats");
export const createTask = (data) => api.post("/bfhl/tasks", data);
export const updateTask = (id, data) => api.patch(`/bfhl/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/bfhl/tasks/${id}`);
