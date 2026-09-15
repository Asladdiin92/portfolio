import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

// ─── Singleton Axios instance ─────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,   // send HttpOnly refresh token cookie on every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Token store ──────────────────────────────────────────────────────────────
// Access token lives in memory only — never localStorage/sessionStorage
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => { accessToken = token; },
  clear: () => { accessToken = null; },
};

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: silent token refresh on 401 ───────────────────────
let isRefreshing = false;
// Queue of requests that arrived while a refresh was in flight
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const drainQueue = (newToken: string) => {
  refreshQueue.forEach(({ resolve }) => resolve(newToken));
  refreshQueue = [];
};

const rejectQueue = (err: unknown) => {
  refreshQueue.forEach(({ reject }) => reject(err));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retried?: boolean;
    };

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    // Don't retry the refresh endpoint itself — that would loop forever
    if (originalRequest.url?.includes('/auth/refresh')) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      // Another refresh is already in flight — queue this request
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const { data } = await apiClient.post<{ accessToken: string }>(
        '/auth/refresh'
      );
      const newToken = data.accessToken;
      tokenStore.set(newToken);
      drainQueue(newToken);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStore.clear();
      rejectQueue(refreshError);
      // Redirect to login if refresh fails — handled by the router
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
