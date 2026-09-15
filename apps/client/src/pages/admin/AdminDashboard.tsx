import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminProjects } from './AdminProjects';
import { AdminMedia } from './AdminMedia';
import { AdminSettings } from './AdminSettings';
import { AdminMessages } from './AdminMessages';
import { AdminSocials } from './AdminSocials';
import { AdminHero } from './AdminHero';

type Tab = 'projects' | 'media' | 'messages' | 'socials' | 'hero' | 'settings';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [tab, setTab]    = useState<Tab>('projects');

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div>
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Panel</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Signed in as <span className="text-[var(--color-accent)]">{user?.email}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-danger)]/50 hover:text-[var(--color-danger)]"
        >
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="mb-8 flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
      >
        {([
          { id: 'projects', label: '📁 Projects'      },
          { id: 'media',    label: '🖼️ Gallery'        },
          { id: 'messages', label: '💬 Messages'       },
          { id: 'socials',  label: '🔗 Social Links'   },
          { id: 'hero',     label: '🦸 Hero'           },
          { id: 'settings', label: '⚙️ Site Settings'  },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={[
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-150',
              tab === id
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'projects' && <AdminProjects />}
      {tab === 'media'    && <AdminMedia />}
      {tab === 'messages' && <AdminMessages />}
      {tab === 'socials'  && <AdminSocials />}
      {tab === 'hero'     && <AdminHero />}
      {tab === 'settings' && <AdminSettings />}
    </div>
  );
}
