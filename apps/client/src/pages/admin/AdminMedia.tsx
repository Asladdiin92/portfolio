import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { UploadModal } from '../../components/UploadModal';

interface MediaItem {
  _id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  category: string;
  mediaType: 'photo' | 'video';
  isPublic: boolean;
  takenAt: string;
}

export function AdminMedia() {
  const [items, setItems]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: MediaItem[] }>('/media/admin');
      setItems(data.data ?? []);
    } catch {
      setError('Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleVisibility(item: MediaItem) {
    setToggling(item._id);
    try {
      await apiClient.patch(`/media/${item._id}`, { isPublic: !item.isPublic });
      load();
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this memory? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/media/${id}`);
      load();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Gallery</h2>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
        >
          + Add memory
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No media uploaded yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item._id} className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.thumbnailUrl}
                  alt={item.caption}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Video badge */}
              {item.mediaType === 'video' && (
                <span aria-hidden className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Video
                </span>
              )}

              {/* Visibility badge */}
              <span className={[
                'absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium',
                item.isPublic
                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                  : 'bg-black/60 text-white/70',
              ].join(' ')}>
                {item.isPublic ? 'Public' : 'Private'}
              </span>

              {/* Hover actions */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="mb-2 line-clamp-2 text-xs font-medium text-white">{item.caption}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={toggling === item._id}
                    onClick={() => toggleVisibility(item)}
                    className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs text-white hover:bg-white/20 disabled:opacity-40"
                  >
                    {toggling === item._id ? '…' : (item.isPublic ? '🔒 Hide' : '🌍 Show')}
                  </button>
                  <button
                    type="button"
                    disabled={deleting === item._id}
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg bg-[var(--color-danger)]/20 px-3 py-1.5 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/40 disabled:opacity-40"
                  >
                    {deleting === item._id ? '…' : '🗑'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); load(); }}
        />
      )}
    </div>
  );
}
