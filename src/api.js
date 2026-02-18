import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const getAccessToken = () =>
  localStorage.getItem("access") ||
  sessionStorage.getItem("access") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token");

const getRefreshToken = () =>
  localStorage.getItem("refresh") ||
  sessionStorage.getItem("refresh") ||
  localStorage.getItem("refresh_token") ||
  sessionStorage.getItem("refresh_token");

const setAccessToken = (token) => {
  if (localStorage.getItem("access") !== null || localStorage.getItem("refresh") !== null) {
    localStorage.setItem("access", token);
  }
  if (sessionStorage.getItem("access") !== null || sessionStorage.getItem("refresh") !== null) {
    sessionStorage.setItem("access", token);
  }
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("role");

  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");

  window.location.replace("/login");
};

const attachAccessToken = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

API.interceptors.request.use(attachAccessToken);
axios.interceptors.request.use(attachAccessToken);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const shouldSkipAuthHandling = (url = "") =>
  url.includes("/token/") || url.includes("/auth/login/") || url.includes("/login/");

const setupResponseInterceptor = (client) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const status = error?.response?.status;
      const detail = (error?.response?.data?.detail || "").toString().toLowerCase();

      if (status === 401 && detail.includes("password change required")) {
        window.location.replace("/faculty/profile?tab=password");
        return Promise.reject(error);
      }

      if (status !== 401 || originalRequest._retry || shouldSkipAuthHandling(originalRequest.url)) {
        return Promise.reject(error);
      }

      const refresh = getRefreshToken();
      if (!refresh) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
        const newAccess = response?.data?.access;
        if (!newAccess) {
          throw new Error("No access token returned on refresh");
        }

        setAccessToken(newAccess);
        onRefreshed(newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return client(originalRequest);
      } catch (refreshError) {
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};

setupResponseInterceptor(API);
setupResponseInterceptor(axios);

export default API;
