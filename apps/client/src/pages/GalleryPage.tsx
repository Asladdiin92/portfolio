import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { UploadModal } from '../components/UploadModal';

// ── Types ─────────────────────────────────────────────────────────────────────
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

interface ApiResponse {
  success: boolean;
  data: MediaItem[];
  meta: { total: number; page: number; pages: number };
}

const CATEGORIES = ['All', 'Campus', 'Projects', 'Events', 'Community', 'Personal', 'Tech'];
const TYPES      = ['All', 'photo', 'video'];

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];

  // Close on Escape, navigate with arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Media viewer: ${item.caption}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Content — stop propagation so clicking media doesn't close */}
      <div
        className="relative flex max-h-full max-w-5xl w-full flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          aria-label="Close viewer"
          onClick={onClose}
          className="absolute -top-2 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>

        {/* Media */}
        <div className="flex max-h-[75vh] w-full items-center justify-center overflow-hidden rounded-xl">
          {item.mediaType === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
          ) : (
            <img
              src={item.url}
              alt={item.caption}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
          )}
        </div>

        {/* Caption + meta */}
        <div className="flex w-full items-start justify-between gap-4 px-2">
          <div>
            <p className="text-sm font-medium text-white">{item.caption}</p>
            <p className="mt-0.5 text-xs text-white/50">
              {item.category} · {new Date(item.takenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <p className="shrink-0 text-xs text-white/40">
            {index + 1} / {items.length}
          </p>
        </div>

        {/* Prev / Next */}
        {items.length > 1 && (
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={onPrev}
              disabled={index === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={onNext}
              disabled={index === items.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gallery card ──────────────────────────────────────────────────────────────
function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View: ${item.caption}`}
      className="group relative w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
    >
      {/* Thumbnail */}
      <div className="overflow-hidden">
        <img
          src={item.mediaType === 'photo' ? item.url : item.thumbnailUrl}
          alt={item.caption}
          loading="lazy"
          className="block h-auto max-h-[32rem] w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Video play badge */}
      {item.mediaType === 'video' && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white text-lg"
        >
          ▶
        </span>
      )}

      {/* Private badge */}
      {!item.isPublic && (
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70">
          Private
        </span>
      )}

      {/* Hover overlay with caption */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="line-clamp-2 text-left text-xs font-medium text-white">{item.caption}</p>
        <p className="mt-0.5 text-left text-[10px] text-white/60">{item.category}</p>
      </div>
    </button>
  );
}

// ── Main Gallery page ─────────────────────────────────────────────────────────
export function GalleryPage() {
  const [items, setItems]           = useState<MediaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [category, setCategory]     = useState('All');
  const [type, setType]             = useState('All');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchItems = useCallback(async (cat: string, tp: string, pg: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '24' });
      if (cat !== 'All') params.set('category', cat);
      if (tp  !== 'All') params.set('type', tp);
      const { data } = await apiClient.get<ApiResponse>(`/media?${params}`);
      setItems(data.data ?? []);
      setTotalPages(data.meta.pages);
      setTotal(data.meta.total);
    } catch {
      setError('Failed to load gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(category, type, page); }, [fetchItems, category, type, page]);

  const handleFilterChange = (cat: string, tp: string) => {
    setCategory(cat);
    setType(tp);
    setPage(1);
  };

  const handleUploaded = () => {
    setShowUpload(false);
    fetchItems(category, type, page);
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Gallery</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {total} {total === 1 ? 'memory' : 'memories'}
          </p>
        </div>
        {/* Upload button — shown when logged in as admin */}
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          + Add memory
        </button>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={cat === category}
            onClick={() => handleFilterChange(cat, type)}
            className={[
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150',
              cat === category
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="mb-8 flex gap-2" role="group" aria-label="Filter by type">
        {TYPES.map((tp) => (
          <button
            key={tp}
            type="button"
            aria-pressed={tp === type}
            onClick={() => handleFilterChange(category, tp)}
            className={[
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 capitalize',
              tp === type
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {tp === 'photo' ? '📷 Photos' : tp === 'video' ? '🎥 Videos' : 'All'}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📷</p>
          <p className="text-sm text-[var(--color-muted)]">No memories yet in this category.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && items.length > 0 && (
        <>
          <ul
            className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Media gallery"
          >
            {items.map((item, idx) => (
              <li key={item._id} className="flex">
                <MediaCard item={item} onClick={() => setLightboxIdx(idx)} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-muted)] disabled:opacity-40 hover:text-[var(--color-text)]"
              >
                ← Prev
              </button>
              <span className="text-sm text-[var(--color-muted)]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-muted)] disabled:opacity-40 hover:text-[var(--color-text)]"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          items={items}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => (i! > 0 ? i! - 1 : i))}
          onNext={() => setLightboxIdx((i) => (i! < items.length - 1 ? i! + 1 : i))}
        />
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}
