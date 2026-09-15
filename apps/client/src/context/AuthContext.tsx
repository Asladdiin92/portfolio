import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiClient, tokenStore } from '../lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthUser {
  _id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: AuthUser;
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── Silent refresh on mount — restore session from HttpOnly cookie ──────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.post<RefreshResponse>('/auth/refresh');
        if (!cancelled) {
          tokenStore.set(data.accessToken);
          // Decode user from token payload (base64 middle segment)
          const payload = JSON.parse(atob(data.accessToken.split('.')[1])) as AuthUser & { sub: string };
          setUser({ _id: payload.sub, email: payload.email, role: payload.role });
        }
      } catch {
        // No valid session — stay logged out
        if (!cancelled) tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    tokenStore.set(data.accessToken);
    setUser(data.user);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'admin', isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
