import axios from "axios";
import { config } from "./config";

// Set your API base URL here
const { BASE_URL } = config();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
