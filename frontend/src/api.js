import axios from "axios";

const BASE_URL = process.env.API_BASE_URL || process.env.API_BASE_DEV_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      originalRequest?.url?.includes("/users/login") ||
      originalRequest?.url?.includes("/users/registration") ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    if (status === 401) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/users/refresh", {});

        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
      } catch (err) {
        console.error("🔒 Token refresh failed:", err.message);
        isRefreshing = false;
        refreshSubscribers = [];

        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
