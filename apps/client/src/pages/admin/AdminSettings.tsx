import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useCloudinaryWidget } from '../../lib/useCloudinaryWidget';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConfigItem {
  _id: string;
  key: string;
  label: string;
  value: string;
}

// ── Cloud sources shown as badges ─────────────────────────────────────────────
const CLOUD_SOURCES = [
  { name: 'Google Drive',  icon: '📁', color: '#0f9d58' },
  { name: 'OneDrive',      icon: '☁️', color: '#0078d4' },
  { name: 'Dropbox',       icon: '📦', color: '#0061fe' },
  { name: 'Unsplash',      icon: '🌄', color: '#111'    },
  { name: 'Device',        icon: '💻', color: '#6366f1' },
  { name: 'Camera',        icon: '📷', color: '#f59e0b' },
  { name: 'Direct URL',    icon: '🔗', color: '#94a3b8' },
];

const IMAGE_CONFIG_KEYS = new Set([
  'card_img_location',
  'card_img_about',
  'card_img_learning',
  'card_img_education',
  'card_img_growth',
  'card_img_focus',
  'card_img_craft',
  'exp_campus_photo',
]);

// ── Single card image manager ─────────────────────────────────────────────────
function CardImageUploader({ item, onUpdated }: { item: ConfigItem; onUpdated: () => void }) {
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [urlInput, setUrlInput]   = useState('');
  const [showUrl, setShowUrl]     = useState(false);
  const [urlSaving, setUrlSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // ── Cloudinary widget — handles Google Drive, OneDrive, Dropbox etc ─────────
  const openCloudWidget = useCloudinaryWidget(async ({ secureUrl: url }) => {
    // Widget already uploaded to Cloudinary — just save the URL
    setError(null);
    try {
      await apiClient.patch(`/config/${item.key}`, { value: url });
      window.dispatchEvent(new Event('site-branding-updated'));
      onUpdated();
    } catch {
      setError('Failed to save. Try again.');
    }
  });

  // ── Local file upload ───────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    if (!ACCEPTED.includes(file.type)) { setError('Use JPEG, PNG, WebP or GIF.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Max file size is 10 MB.'); return; }
    setError(null); setUploading(true); setProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);
      await apiClient.post(`/config/${item.key}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); },
      });
      window.dispatchEvent(new Event('site-branding-updated'));
      onUpdated();
    } catch { setError('Upload failed. Try again.'); }
    finally { setUploading(false); }
  }

  // ── Direct URL save ─────────────────────────────────────────────────────────
  async function saveUrl() {
    const url = urlInput.trim();
    if (!url) { setError('Paste a URL first.'); return; }
    try { new URL(url); } catch { setError('Invalid URL.'); return; }
    setError(null); setUrlSaving(true);
    try {
      await apiClient.patch(`/config/${item.key}`, { value: url });
      setUrlInput(''); setShowUrl(false);
      window.dispatchEvent(new Event('site-branding-updated'));
      onUpdated();
    } catch { setError('Save failed. Try again.'); }
    finally { setUrlSaving(false); }
  }

  // ── Remove ──────────────────────────────────────────────────────────────────
  async function handleRemove() {
    if (!window.confirm(`Remove image for "${item.label}"?`)) return;
    try {
      await apiClient.patch(`/config/${item.key}`, { value: '' });
      setPreviewError(false);
      window.dispatchEvent(new Event('site-branding-updated'));
      onUpdated();
    } catch { setError('Remove failed.'); }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      <div className="relative h-36 w-full bg-[var(--color-surface-2)]">
        {item.value && !previewError ? (
          <>
            <img
              src={item.value}
              alt={item.label}
              className={[
                'h-full w-full',
                item.key === 'site_logo' || item.key === 'site_app_icon'
                  ? 'object-contain p-4'
                  : 'object-contain',
              ].join(' ')}
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove image for ${item.label}`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-[var(--color-danger)]/80"
            >✕</button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--color-muted)]">
            <span className="text-3xl" aria-hidden>{previewError ? '⚠️' : '🖼️'}</span>
            <span className="text-xs">{previewError ? 'Image failed to load' : 'No image set'}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Label + key */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text)]">{item.label}</p>
          <p className="text-[10px] font-mono text-[var(--color-muted)]/60 truncate">{item.key}</p>
        </div>

        {/* ── PRIMARY: Cloud storage button ────────────────────────────── */}
        <button
          type="button"
          onClick={openCloudWidget}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all duration-150 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 active:scale-95"
        >
          <span className="text-lg" aria-hidden>☁️</span>
          {item.value ? 'Change from Cloud Storage' : 'Add from Cloud Storage'}
        </button>

        {/* Cloud source badges */}
        <div className="flex flex-wrap gap-1.5">
          {CLOUD_SOURCES.map(({ name, icon, color }) => (
            <span
              key={name}
              className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
              style={{ borderColor: `${color}40`, color, background: `${color}18` }}
            >
              {icon} {name}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-[10px] text-[var(--color-muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {/* ── SECONDARY: drag-drop local file ──────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload local file for ${item.label}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          className={[
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-3 text-center transition-colors duration-150',
            dragging
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
              : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/40',
          ].join(' ')}
        >
          <span className="text-xs text-[var(--color-muted)]">⬆️ Upload from device</span>
          <span className="mt-0.5 text-[10px] text-[var(--color-muted)]/60">JPEG · PNG · WebP · max 10 MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
        </div>

        {/* ── TERTIARY: paste direct URL ────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="w-full text-center text-[10px] text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          {showUrl ? '▲ Hide URL input' : '🔗 Paste a direct image URL instead'}
        </button>

        {showUrl && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setError(null); setPreviewError(false); }}
                placeholder="https://… (direct image link)"
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                disabled={urlSaving || !urlInput.trim()}
                onClick={saveUrl}
                className="shrink-0 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[var(--color-accent-hover)]"
              >
                {urlSaving ? '…' : 'Set'}
              </button>
            </div>
            {urlInput.trim() && (
              <img
                src={urlInput.trim()}
                alt="URL preview"
                className="h-16 w-full rounded-lg object-contain border border-[var(--color-border)]"
                onError={() => setError('⚠️ Image failed to load. Use a direct image URL (.jpg/.png/.webp).')}
                onLoad={() => setError(null)}
              />
            )}
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-[var(--color-muted)]">
              <span>Uploading…</span><span>{progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-[10px] text-[var(--color-danger)]">{error}</p>}
      </div>
    </div>
  );
}

// ── Main AdminSettings panel ──────────────────────────────────────────────────
export function AdminSettings() {
  const [items, setItems]     = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: ConfigItem[] }>('/config/full');
      setItems(data.data ?? []);
    } catch {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Site Settings</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your portfolio logo, app icon, and section images.
          Set a hover image for each About section card.
          Click <strong className="text-[var(--color-accent)]">☁️ Add from Cloud Storage</strong> to
          pick from Google Drive, OneDrive, Dropbox, or directly from your device.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Portfolio branding
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.filter((item) => item.key === 'site_logo' || item.key === 'site_app_icon').map((item) => (
                <CardImageUploader key={item.key} item={item} onUpdated={load} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Section images
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.filter((item) => IMAGE_CONFIG_KEYS.has(item.key)).map((item) => (
                <CardImageUploader key={item.key} item={item} onUpdated={load} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
