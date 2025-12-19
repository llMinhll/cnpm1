import axios from "axios";

export const API_BASE = "http://localhost:3000/api";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bus_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
