import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { SocialIcon, KNOWN_PLATFORMS, PLATFORM_COLORS } from '../../components/SocialIcon';

interface SocialLink {
  _id:           string;
  label:         string;
  url:           string;
  platform:      string;
  icon:          string;
  order:         number;
  visible:       boolean;
  showInHero:    boolean;
  showInContact: boolean;
}

const EMPTY: Omit<SocialLink, '_id' | 'order'> = {
  label: '', url: '', platform: 'custom', icon: '',
  visible: true, showInHero: true, showInContact: true,
};

// ── Link form ─────────────────────────────────────────────────────────────────
function LinkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<SocialLink>;
  onSave: (data: Omit<SocialLink, '_id' | 'order'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm]     = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) { setError('Label and URL are required.'); return; }
    setSaving(true); setError(null);
    try {
      await onSave(form);
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isKnown = KNOWN_PLATFORMS.includes(form.platform.toLowerCase());

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-6">
      <h3 className="text-sm font-bold text-[var(--color-text)]">
        {initial._id ? 'Edit link' : 'Add new link'}
      </h3>

      {/* Platform selector */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Platform</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[...KNOWN_PLATFORMS, 'custom'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set('platform', p)}
              className={[
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize',
                form.platform === p
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40',
              ].join(' ')}
            >
              <SocialIcon platform={p} emoji="✨" size={12} />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Label + URL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Label</label>
          <input
            type="text" required value={form.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder="e.g. GitHub, Telegram, Portfolio"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">URL</label>
          <input
            type="text" required value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://… or mailto:… or tel:…"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Emoji — only for custom/unknown platforms */}
      {!isKnown && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Emoji icon <span className="font-normal normal-case tracking-normal text-[var(--color-muted)]">(custom platforms only)</span>
          </label>
          <input
            type="text" value={form.icon} maxLength={4}
            onChange={(e) => set('icon', e.target.value)}
            placeholder="e.g. 🔗 💬 🌐"
            className="w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      )}

      {/* Preview */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${PLATFORM_COLORS[form.platform] ?? '#6366f1'}20`, border: `1px solid ${PLATFORM_COLORS[form.platform] ?? '#6366f1'}40` }}
        >
          <SocialIcon platform={form.platform} emoji={form.icon} size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">{form.label || 'Preview label'}</p>
          <p className="text-xs text-[var(--color-muted)] truncate max-w-xs">{form.url || 'https://…'}</p>
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {([
          { key: 'visible',       label: 'Visible',          hint: 'Show this link at all' },
          { key: 'showInHero',    label: 'Show in Hero',      hint: 'Hero social icon row' },
          { key: 'showInContact', label: 'Show in Contact',   hint: 'Contact section links' },
        ] as { key: keyof typeof form; label: string; hint: string }[]).map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)]">{label}</p>
              <p className="text-[10px] text-[var(--color-muted)]">{hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form[key] as boolean}
              onClick={() => set(key, !form[key] as never)}
              className={['relative h-5 w-9 rounded-full transition-colors', form[key] ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'].join(' ')}
            >
              <span className={['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', form[key] ? 'translate-x-4' : 'translate-x-0.5'].join(' ')} />
            </button>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="text-xs text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={saving}
          className="flex-1 rounded-lg border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-40">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40">
          {saving ? 'Saving…' : (initial._id ? 'Update' : 'Add link')}
        </button>
      </div>
    </form>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function AdminSocials() {
  const [links, setLinks]     = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<SocialLink> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: SocialLink[] }>('/socials/all');
      setLinks(data.data ?? []);
    } catch { setError('Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(form: Omit<SocialLink, '_id' | 'order'>) {
    if (editing?._id) {
      await apiClient.patch(`/socials/${editing._id}`, form);
    } else {
      await apiClient.post('/socials', { ...form, order: links.length });
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this link?')) return;
    setDeleting(id);
    try { await apiClient.delete(`/socials/${id}`); load(); }
    finally { setDeleting(null); }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx   = links.findIndex((l) => l._id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= links.length) return;
    const reordered = [...links];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setLinks(reordered);
    await apiClient.post('/socials/reorder', { ids: reordered.map((l) => l._id) });
  }

  if (editing !== null) {
    return (
      <div>
        <button type="button" onClick={() => setEditing(null)}
          className="mb-4 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]">
          ← Back
        </button>
        <LinkForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Social Links</h2>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Manage links shown in the Hero and Contact sections. Add any platform — Telegram, Discord, Bluesky, or custom.
          </p>
        </div>
        <button type="button" onClick={() => setEditing({})}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]">
          + Add link
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />)}
        </div>
      )}

      {!loading && error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-2 list-none p-0 m-0">
          {links.map((link, idx) => (
            <li
              key={link._id}
              className={[
                'flex items-center gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] px-4 py-3 transition-opacity',
                !link.visible ? 'opacity-50' : '',
                'border-[var(--color-border)]',
              ].join(' ')}
            >
              {/* Icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${PLATFORM_COLORS[link.platform] ?? '#6366f1'}20` }}
              >
                <SocialIcon platform={link.platform} emoji={link.icon} size={16} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">{link.label}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{link.url}</p>
              </div>

              {/* Visibility badges */}
              <div className="hidden sm:flex gap-1">
                {link.showInHero    && <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] text-[var(--color-accent)]">Hero</span>}
                {link.showInContact && <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400">Contact</span>}
                {!link.visible      && <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-muted)]">Hidden</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button type="button" disabled={idx === 0} onClick={() => move(link._id, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-20">▲</button>
                <button type="button" disabled={idx === links.length - 1} onClick={() => move(link._id, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-20">▼</button>
                <button type="button" onClick={() => setEditing(link)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]">Edit</button>
                <button type="button" disabled={deleting === link._id} onClick={() => handleDelete(link._id)}
                  className="rounded-lg border border-[var(--color-danger)]/30 px-3 py-1 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 disabled:opacity-40">
                  {deleting === link._id ? '…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
