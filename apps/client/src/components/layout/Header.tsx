import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/',         label: 'Home'     },
  { to: '/projects', label: 'Projects' },
  { to: '/gallery',  label: 'Gallery'  },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin, logout }     = useAuth();
  const navigate                = useNavigate();

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <>
      {/* ── Pill navbar ───────────────────────────────────────────────────── */}
      <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-bg)]/80 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">

          {/* Logo */}
          <NavLink
            to="/"
            aria-label="Go to home"
            className="flex items-center gap-2 no-underline"
          >
            {/* Home icon */}
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span className="text-sm font-bold italic text-[var(--color-accent)] tracking-tight">
              asladin.dev
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3.5 py-1.5 text-sm font-medium no-underline transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side — admin controls */}
          <div className="hidden items-center gap-2 sm:flex">
            {isAdmin ? (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3.5 py-1.5 text-sm font-medium no-underline transition-all duration-150',
                      isActive
                        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
                    ].join(' ')
                  }
                >
                  Admin
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-[var(--color-danger)]/30 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger)]/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-muted)] no-underline transition-all hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
              >
                Admin ⚙
              </NavLink>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-1.5 sm:hidden"
          >
            <span className={`block h-0.5 w-5 rounded-full bg-[var(--color-text)] transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-[var(--color-text)] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-[var(--color-text)] transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile drawer — drops below the pill */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="mt-2 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-bg)]/90 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:hidden"
          >
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        'block rounded-lg px-3 py-2 text-sm font-medium no-underline transition-all duration-150',
                        isActive
                          ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
                      ].join(' ')
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 border-t border-[var(--color-border)]/50 pt-2">
                {isAdmin ? (
                  <div className="flex flex-col gap-1">
                    <NavLink
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        ['block rounded-lg px-3 py-2 text-sm font-medium no-underline', isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'].join(' ')
                      }
                    >
                      Admin panel
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg border border-[var(--color-danger)]/30 py-2 text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted)] no-underline hover:text-[var(--color-accent)]"
                  >
                    Admin ⚙
                  </NavLink>
                )}
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="h-20" aria-hidden />
    </>
  );
}
