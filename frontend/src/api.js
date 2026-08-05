import axios from "axios";

export const API_URL = "https://car-service-dashboard.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

export default api;