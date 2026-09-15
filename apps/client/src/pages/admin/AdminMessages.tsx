import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ApiResponse {
  data: Message[];
  meta: { total: number; unreadCount: number };
}

export function AdminMessages() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [unreadCount, setUnread]  = useState(0);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse>('/contact');
      setMessages(data.data ?? []);
      setUnread(data.meta.unreadCount);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    try {
      await apiClient.patch(`/contact/${id}/read`);
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
      setUnread((n) => Math.max(0, n - 1));
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this message?')) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/contact/${id}`);
      load();
    } finally {
      setDeleting(null);
    }
  }

  function handleExpand(id: string) {
    setExpanded((prev) => prev === id ? null : id);
    const msg = messages.find((m) => m._id === id);
    if (msg && !msg.read) markRead(id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Messages</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-bold text-white">
            {unreadCount} new
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-3 text-4xl" aria-hidden>📭</span>
          <p className="text-sm text-[var(--color-muted)]">No messages yet.</p>
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <ul className="space-y-3 list-none p-0 m-0">
          {messages.map((msg) => (
            <li
              key={msg._id}
              className={[
                'rounded-[var(--radius-card)] border bg-[var(--color-surface)] transition-all duration-150',
                !msg.read
                  ? 'border-[var(--color-accent)]/40'
                  : 'border-[var(--color-border)]',
              ].join(' ')}
            >
              {/* Header row */}
              <button
                type="button"
                onClick={() => handleExpand(msg._id)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {!msg.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-label="Unread" />
                    )}
                    <span className="font-semibold text-sm text-[var(--color-text)]">{msg.name}</span>
                    <span className="text-xs text-[var(--color-muted)]">{msg.email}</span>
                  </div>
                  <p className="truncate text-xs text-[var(--color-muted)]">{msg.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[10px] text-[var(--color-muted)]">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {expanded === msg._id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded body */}
              {expanded === msg._id && (
                <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4">
                  <p className="mb-4 whitespace-pre-wrap text-sm text-[var(--color-muted)] leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your message on asladin.dev`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-[var(--color-accent-hover)]"
                    >
                      ✉️ Reply
                    </a>
                    <button
                      type="button"
                      disabled={deleting === msg._id}
                      onClick={() => handleDelete(msg._id)}
                      className="rounded-lg border border-[var(--color-danger)]/30 px-4 py-2 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 disabled:opacity-40"
                    >
                      {deleting === msg._id ? '…' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
