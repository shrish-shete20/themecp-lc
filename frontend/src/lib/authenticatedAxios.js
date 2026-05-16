import axios from "axios";
import { supabase } from "../auth.jsx";

function targetsBackend(config) {
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    apiUrl &&
    typeof config.url === "string" &&
    config.url.startsWith(apiUrl)
  );
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const expiresAt = session.expires_at || 0;
  const refreshBefore = Math.floor(Date.now() / 1000) + 60;

  if (expiresAt > refreshBefore) {
    return session.access_token;
  }

  const {
    data: { session: refreshedSession },
  } = await supabase.auth.refreshSession();

  return refreshedSession?.access_token || session.access_token;
}

axios.interceptors.request.use(async (config) => {
  if (!targetsBackend(config)) return config;

  const accessToken = await getAccessToken();

  if (accessToken) {
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

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return axios(originalRequest);
  }
);
