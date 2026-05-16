import axios from "axios";
import { supabase } from "../auth.jsx";

axios.interceptors.request.use(async (config) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const targetsBackend =
    apiUrl &&
    typeof config.url === "string" &&
    config.url.startsWith(apiUrl);

  if (!targetsBackend) return config;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});
