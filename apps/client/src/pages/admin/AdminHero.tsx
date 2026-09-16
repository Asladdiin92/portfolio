import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useCloudinaryWidget } from '../../lib/useCloudinaryWidget';

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigMap = Record<string, string>;

// ── Field definitions ─────────────────────────────────────────────────────────
interface TextField {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  textarea?: boolean;
}

const TEXT_FIELDS: TextField[] = [
  { key: 'hero_name_first',       label: 'First name',            placeholder: 'Asladdiin',                         hint: 'Large gradient name — top line'         },
  { key: 'hero_name_last',        label: 'Last name',             placeholder: 'Abduqaadir',                        hint: 'Smaller muted name — second line'       },
  { key: 'hero_badge',            label: 'Status badge',          placeholder: 'Open to freelance & opportunities', hint: 'Green dot badge text at the top'        },
  { key: 'hero_tags',             label: 'Role tags',             placeholder: 'IT Student · FREELANCE · Community Builder', hint: 'Separate with · character'    },
  { key: 'hero_bio',              label: 'Bio paragraph',         placeholder: 'Building practical web, desktop & local-tech solutions…', hint: 'Short bio below tags', textarea: true },
  { key: 'hero_typewriter_words', label: 'Typewriter words',      placeholder: 'Developer,Builder,Problem Solver,Student,Freelancer',    hint: 'Comma-separated, cycles automatically' },
  { key: 'hero_cta_primary',      label: 'Primary button label',  placeholder: 'View projects',                     hint: 'Main CTA button (links to /projects)'  },
  { key: 'hero_cta_secondary',    label: 'Secondary button label',placeholder: 'Gallery',                           hint: 'Secondary CTA button (links to /gallery)' },
  { key: 'hero_badge1',           label: 'Floating badge 1',      placeholder: 'Java',                              hint: 'Top-left floating chip on photo'        },
  { key: 'hero_badge2',           label: 'Floating badge 2',      placeholder: 'React',                             hint: 'Top-right floating chip on photo'       },
  { key: 'hero_badge3',           label: 'Floating badge 3',      placeholder: 'Node.js',                           hint: 'Bottom-left floating chip on photo'     },
  { key: 'hero_badge4',           label: 'Floating badge 4',      placeholder: 'GIS',                               hint: 'Bottom-right floating chip on photo'    },
] satisfies TextField[];

// ── Image uploader (reusable for profile + background) ───────────────────────
function HeroImageUploader({
  configKey,
  label,
  description,
  currentUrl,
  onSaved,
  aspectClass = 'h-64',
  objectPosition = 'object-top',
}: {
  configKey: string;
  label: string;
  description: string;
  currentUrl: string;
  onSaved: (url: string) => void;
  aspectClass?: string;
  objectPosition?: string;
}) {
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [preview, setPreview]     = useState(currentUrl);

  useEffect(() => setPreview(currentUrl), [currentUrl]);

  const openWidget = useCloudinaryWidget(async ({ secureUrl: url }) => {
    try {
      await apiClient.patch(`/config/${configKey}`, { value: url });
      setPreview(url);
      onSaved(url);
    } catch { setError('Save failed.'); }
  });

  async function uploadLocal(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('Max 10 MB'); return; }
    setError(null); setUploading(true); setProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await apiClient.post<{ url: string }>(
        `/config/${configKey}/image`, form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); },
        }
      );
      setPreview(data.url);
      onSaved(data.url);
    } catch { setError('Upload failed.'); }
    finally { setUploading(false); }
  }

  async function handleRemove() {
    if (!window.confirm(`Remove "${label}" image?`)) return;
    try {
      await apiClient.patch(`/config/${configKey}`, { value: '' });
      setPreview('');
      onSaved('');
    } catch { setError('Remove failed.'); }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Preview */}
      <div className={`relative w-full bg-[var(--color-surface-2)] ${aspectClass}`}>
        {preview ? (
          <>
            <img src={preview} alt={label} className={`h-full w-full object-cover ${objectPosition}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">{label}</p>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove ${label}`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-[var(--color-danger)]/80"
            >✕</button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-2 text-[var(--color-muted)]">
            <span className="text-4xl" aria-hidden>🖼️</span>
            <span className="text-xs">No image set</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs font-semibold text-[var(--color-text)]">{label}</p>
        <p className="text-[10px] text-[var(--color-muted)]">{description}</p>

        <button
          type="button"
          onClick={openWidget}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
        >
          ☁️ {preview ? 'Change from Cloud Storage' : 'Add from Cloud Storage'}
        </button>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-3 text-center hover:border-[var(--color-accent)]/50"
        >
          <span className="text-xs text-[var(--color-muted)]">⬆️ Upload from device</span>
          <span className="text-[10px] text-[var(--color-muted)]/60">JPEG · PNG · WebP · max 10 MB</span>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLocal(f); }} />
        </div>

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

// ── Main AdminHero panel ──────────────────────────────────────────────────────
export function AdminHero() {
  const [config, setConfig]   = useState<ConfigMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);
  const [saved, setSaved]     = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: ConfigMap }>('/config');
      setConfig(data.data ?? {});
    } catch { setError('Failed to load config.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveField(key: string, value: string) {
    setSaving(key); setError(null);
    try {
      await apiClient.patch(`/config/${key}`, { value });
      setConfig((prev) => ({ ...prev, [key]: value }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch { setError(`Failed to save ${key}.`); }
    finally { setSaving(null); }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text)]">Hero Settings</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Edit all Hero section content. Changes go live immediately — no code changes needed.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

      {/* Two image uploaders side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HeroImageUploader
          configKey="hero_profile_image"
          label="Profile photo card"
          description="Shown as your photo card on the right side of the Hero section. Use a portrait/headshot for best results."
          currentUrl={config['hero_profile_image'] ?? ''}
          onSaved={(url) => setConfig((prev) => ({ ...prev, hero_profile_image: url }))}
          aspectClass="h-64"
          objectPosition="object-top"
        />
        <HeroImageUploader
          configKey="hero_bg_image"
          label="Full-screen background"
          description="Fills the entire Hero background with a parallax effect that follows your mouse. Use a landscape or wide photo."
          currentUrl={config['hero_bg_image'] ?? ''}
          onSaved={(url) => setConfig((prev) => ({ ...prev, hero_bg_image: url }))}
          aspectClass="h-64"
          objectPosition="object-center"
        />
      </div>

      {/* Text fields grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TEXT_FIELDS.map(({ key, label, placeholder, hint, textarea }) => {
          const val    = config[key] ?? '';
          const isSaving = saving === key;
          const isSaved  = saved  === key;
          return (
            <div key={key} className={textarea ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                {label}
              </label>
              <p className="mb-1.5 text-[10px] text-[var(--color-muted)]/70">{hint}</p>
              <div className="flex gap-2">
                {textarea ? (
                  <textarea
                    rows={3}
                    defaultValue={val}
                    placeholder={placeholder}
                    onBlur={(e) => { if (e.target.value !== val) saveField(key, e.target.value); }}
                    className="flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
                  />
                ) : (
                  <input
                    type="text"
                    defaultValue={val}
                    placeholder={placeholder}
                    onBlur={(e) => { if (e.target.value !== val) saveField(key, e.target.value); }}
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
                  />
                )}
                <div className="flex w-8 shrink-0 items-center justify-center">
                  {isSaving && <span className="text-xs text-[var(--color-muted)] animate-pulse">…</span>}
                  {isSaved  && <span className="text-sm text-[var(--color-success)]">✓</span>}
                </div>
              </div>
              <p className="mt-1 text-[10px] font-mono text-[var(--color-muted)]/50">{key}</p>
            </div>
          );
        })}
      </div>

      {/* Live preview hint */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs font-semibold text-[var(--color-text)] mb-1">💡 How it works</p>
        <ul className="space-y-1 list-none p-0 m-0">
          {[
            'Profile photo card: portrait/headshot — shown in the card on the right side of Hero.',
            'Full-screen background: landscape/wide photo — blurred dark overlay applied automatically.',
            'Typewriter words: comma-separated, e.g. Developer,Builder,Student',
            'Role tags: use · as separator, e.g. IT Student · FREELANCE · Builder',
            'Fields auto-save when you click outside (on blur). Leave empty to use the default value.',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
              <span aria-hidden className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
