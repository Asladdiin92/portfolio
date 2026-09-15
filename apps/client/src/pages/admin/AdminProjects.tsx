import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../../lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

const EMPTY: Omit<Project, '_id'> = {
  title: '',
  description: '',
  techStack: [],
  githubUrl: '',
  liveUrl: '',
  featured: false,
};

// ── Markdown live preview editor ──────────────────────────────────────────────
function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Description <span className="text-[var(--color-danger)]" aria-hidden>*</span>
        </label>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          {preview ? '✏️ Edit' : '👁 Preview'}
        </button>
      </div>

      {preview ? (
        <div className="prose prose-sm max-w-none min-h-[200px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)]">
          {value.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-[var(--color-muted)] italic">Nothing to preview yet…</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Write in Markdown… ## Heading, **bold**, - list item"
          className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
        />
      )}
      <p className="text-right text-xs text-[var(--color-muted)]">Markdown supported</p>
    </div>
  );
}

// ── Project form ──────────────────────────────────────────────────────────────
function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Project, '_id'> & { _id?: string };
  onSave: (data: Omit<Project, '_id'> & { _id?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm]     = useState(initial);
  const [techInput, setTechInput] = useState(initial.techStack.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const techStack = techInput.split(',').map((t) => t.trim()).filter(Boolean);
      await onSave({ ...form, techStack });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Title <span className="text-[var(--color-danger)]" aria-hidden>*</span>
        </label>
        <input
          type="text" required value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Project title"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {/* Markdown description */}
      <MarkdownEditor value={form.description} onChange={(v) => set('description', v)} />

      {/* Tech stack */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Tech stack <span className="text-[var(--color-muted)] font-normal normal-case tracking-normal">(comma-separated)</span>
        </label>
        <input
          type="text" value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          placeholder="React, Node.js, MongoDB"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">GitHub URL</label>
          <input
            type="url" value={form.githubUrl ?? ''}
            onChange={(e) => set('githubUrl', e.target.value)}
            placeholder="https://github.com/…"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Live URL</label>
          <input
            type="url" value={form.liveUrl ?? ''}
            onChange={(e) => set('liveUrl', e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Featured toggle */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">Featured project</p>
          <p className="text-xs text-[var(--color-muted)]">Shown first and highlighted on the home page</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.featured}
          onClick={() => set('featured', !form.featured)}
          className={[
            'relative h-6 w-11 rounded-full transition-colors duration-200',
            form.featured ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
          ].join(' ')}
        >
          <span className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            form.featured ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')} />
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-2.5 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} disabled={saving}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-40">
          Cancel
        </button>
        <button type="submit" disabled={saving || !form.title.trim() || !form.description.trim()}
          className="flex-1 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40">
          {saving ? 'Saving…' : (form._id ? 'Update project' : 'Create project')}
        </button>
      </div>
    </form>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [editing, setEditing]   = useState<(Omit<Project, '_id'> & { _id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: Project[] }>('/projects');
      setProjects(data.data ?? []);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(form: Omit<Project, '_id'> & { _id?: string }) {
    if (form._id) {
      await apiClient.put(`/projects/${form._id}`, form);
    } else {
      await apiClient.post('/projects', form);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await apiClient.delete(`/projects/${id}`);
      load();
    } finally {
      setDeleting(null);
    }
  }

  if (editing !== null) {
    return (
      <div>
        <h2 className="mb-6 text-lg font-bold text-[var(--color-text)]">
          {editing._id ? 'Edit project' : 'New project'}
        </h2>
        <ProjectForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Projects</h2>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY })}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
        >
          + New project
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No projects yet. Create your first one.</p>
      )}

      {!loading && !error && (
        <ul className="space-y-3 list-none p-0 m-0">
          {projects.map((p) => (
            <li key={p._id} className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[var(--color-text)] truncate">{p.title}</span>
                  {p.featured && (
                    <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">Featured</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.techStack.slice(0, 5).map((t) => (
                    <span key={t} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] text-[var(--color-muted)]">{t}</span>
                  ))}
                  {p.techStack.length > 5 && (
                    <span className="text-[10px] text-[var(--color-muted)]">+{p.techStack.length - 5} more</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...p })}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deleting === p._id}
                  onClick={() => handleDelete(p._id)}
                  className="rounded-lg border border-[var(--color-danger)]/30 px-3 py-1.5 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 disabled:opacity-40"
                >
                  {deleting === p._id ? '…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
