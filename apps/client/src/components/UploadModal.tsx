import { useRef, useState } from 'react';
import { apiClient } from '../lib/apiClient';

const CATEGORIES = ['Campus', 'Projects', 'Events', 'Community', 'Personal', 'Tech'];

interface UploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [file, setFile]            = useState<File | null>(null);
  const [preview, setPreview]      = useState<string | null>(null);
  const [caption, setCaption]      = useState('');
  const [category, setCategory]    = useState('Personal');
  const [takenAt, setTakenAt]      = useState(new Date().toISOString().split('T')[0]);
  const [isPublic, setIsPublic]    = useState(true);
  const [uploading, setUploading]  = useState(false);
  const [error, setError]          = useState<string | null>(null);
  const [progress, setProgress]    = useState(0);
  const [dragging, setDragging]    = useState(false);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

  function pickFile(f: File) {
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WebM.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50 MB.');
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file)         return setError('Please select a file.');
    if (!caption.trim()) return setError('Caption is required.');

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const form = new FormData();
      form.append('file',     file);
      form.append('caption',  caption.trim());
      form.append('category', category);
      form.append('takenAt',  takenAt);
      form.append('isPublic', String(isPublic));

      await apiClient.post('/media', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      onUploaded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const isVideo = file?.type.startsWith('video/');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 id="upload-modal-title" className="text-base font-semibold text-[var(--color-text)]">
            Add a memory
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop file or click to select"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            className={[
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-150',
              dragging
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50',
            ].join(' ')}
          >
            {preview ? (
              isVideo ? (
                <video src={preview} className="max-h-40 max-w-full rounded-lg object-contain" muted />
              ) : (
                <img src={preview} alt="Preview" className="max-h-40 max-w-full rounded-lg object-contain" />
              )
            ) : (
              <>
                <span className="mb-2 text-3xl" aria-hidden="true">📁</span>
                <p className="text-sm font-medium text-[var(--color-text)]">Drop a photo or video here</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">or click to browse · max 50 MB</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">JPEG · PNG · WebP · GIF · MP4 · WebM</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            />
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="mb-1.5 block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
              Caption <span className="text-[var(--color-danger)]" aria-hidden="true">*</span>
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a short caption…"
              maxLength={280}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
            />
            <p className="mt-1 text-right text-xs text-[var(--color-muted)]">{caption.length}/280</p>
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="takenAt" className="mb-1.5 block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
                Date taken
              </label>
              <input
                id="takenAt"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                {isPublic ? '🌍 Public' : '🔒 Private'}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {isPublic ? 'Visible to everyone on the gallery page' : 'Only visible to you (admin)'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((v) => !v)}
              className={[
                'relative h-6 w-11 rounded-full transition-colors duration-200',
                isPublic ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                  isPublic ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--color-muted)]">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p role="alert" className="text-xs text-[var(--color-danger)]">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !caption.trim()}
              className="flex-1 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
