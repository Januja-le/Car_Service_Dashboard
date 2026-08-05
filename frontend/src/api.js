import axios from "axios";

const api = axios.create({
  baseURL: "https://car-service-dashboard.onrender.com/api",
});

export default api;