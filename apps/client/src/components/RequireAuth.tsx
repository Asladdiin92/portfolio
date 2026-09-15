import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RequireAuth
 *
 * Wraps protected routes. If the user is not an admin:
 *  - While the session is being restored (isLoading) → show spinner
 *  - Not authenticated → redirect to /login, preserving the intended path
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            aria-label="Loading"
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]"
          />
          <p className="text-sm text-[var(--color-muted)]">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
