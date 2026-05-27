import axios from "axios";
import { clearAuthSession, getAuthToken } from "../auth.jsx";

function targetsBackend(config) {
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    apiUrl &&
    typeof config.url === "string" &&
    config.url.startsWith(apiUrl)
  );
}

axios.interceptors.request.use(async (config) => {
  if (!targetsBackend(config)) return config;

  const accessToken = getAuthToken();

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !targetsBackend(originalRequest)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const accessToken = getAuthToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    clearAuthSession();
    return Promise.reject(error);
  }
);
