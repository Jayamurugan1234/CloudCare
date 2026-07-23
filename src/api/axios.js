import axios from "axios";

const api = axios.create({
  baseURL: "https://cloudcare-backend-m0uf.onrender.com/",
});

api.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url.includes("/auth/login") || config.url.includes("/auth/register");

  if (!isAuthEndpoint) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;