import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getTasks = () => api.get("/tasks");
export const addTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const toggleTask = (id) => api.patch(`/tasks/${id}/toggle`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
