import axios from "axios";

// Set your API base URL here
const BASE_URL = "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
