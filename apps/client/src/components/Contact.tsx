import { type FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { SocialIcon } from './SocialIcon';
import { fadeUp, staggerContainer, staggerFast, scaleIn, slideLeft, slideRight } from '../lib/motion';

interface SocialLink {
  _id: string; label: string; url: string;
  platform: string; icon: string;
  showInContact: boolean; visible: boolean;
}

// ── Workflow pipeline data ────────────────────────────────────────────────────
const workflow = [
  { label: 'IDEA',    icon: '💡', color: '#f59e0b' },
  { label: 'PLAN',    icon: '📋', color: '#8b5cf6' },
  { label: 'DESIGN',  icon: '🎨', color: '#ec4899' },
  { label: 'CODE',    icon: '</>',color: '#6366f1' },
  { label: 'REVIEW',  icon: '🔍', color: '#06b6d4' },
  { label: 'TEST',    icon: '🧪', color: '#ef4444' },
  { label: 'LEARN',   icon: '📖', color: '#22c55e' },
];

// ── Social links ──────────────────────────────────────────────────────────────
const socials = [
  { label: 'Email',    value: 'asladdiinabduqaadir@gmail.com', href: 'mailto:asladdiinabduqaadir@gmail.com', icon: '✉️' },
  { label: 'Phone',    value: '+251 992 947 709',              href: 'tel:+251992947709',                   icon: '📞' },
  { label: 'GitHub',   value: 'Asladdiin92',                   href: 'https://github.com/Asladdiin92',      icon: '🐙', external: true },
  { label: 'X',        value: '@asladin15',                    href: 'https://x.com/asladin15',             icon: '🐦', external: true },
  { label: 'Facebook', value: 'Asladdiin',                     href: 'https://facebook.com/asladdiin',      icon: '📘', external: true },
  { label: 'TikTok',   value: '@asladdiinabduqaadir',          href: 'https://tiktok.com/@asladdiinabduqaadir', icon: '🎵', external: true },
];

// ── Workflow Pipeline ─────────────────────────────────────────────────────────
function WorkflowPipeline() {
  return (
    <div className="mb-16">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        Workflow
      </p>
      <div className="overflow-x-auto pb-2">
        <motion.div
          className="flex min-w-max items-center gap-0"
          variants={staggerFast}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {workflow.map(({ label, icon, color }, i) => (
            <div key={label} className="flex items-center">
              <motion.div variants={scaleIn} className="flex flex-col items-center gap-2">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg"
                  style={{ background: `${color}20`, border: `1px solid ${color}50`, boxShadow: `0 4px 16px ${color}20` }}
                  whileHover={{ scale: 1.15, y: -4, boxShadow: `0 8px 24px ${color}40`, transition: { duration: 0.2 } }}
                  aria-hidden
                >
                  {icon === '</>' ? (
                    <span className="font-mono text-xs font-bold" style={{ color }}>&lt;/&gt;</span>
                  ) : icon}
                </motion.div>
                <span className="text-[10px] font-bold tracking-widest" style={{ color }}>{label}</span>
              </motion.div>
              {i < workflow.length - 1 && (
                <div
                  className="mx-1 h-px w-8 shrink-0"
                  style={{ background: `linear-gradient(90deg, ${color}60, ${workflow[i + 1].color}60)` }}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Contact form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await apiClient.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() });
      setSuccess(true);
      setName(''); setEmail(''); setMessage('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to send. Please try again or email me directly.');
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]/20 text-3xl">
          ✅
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text)]">Message sent!</h3>
        <p className="max-w-xs text-sm text-[var(--color-muted)]">
          Thanks for reaching out. I'll get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-2 text-xs text-[var(--color-accent)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Name + Email row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind? Include project scope, timeline, and preferred stack for a fast response."
          className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
        />
        <p className="mt-1 text-right text-[10px] text-[var(--color-muted)]">
          {message.length}/2000
        </p>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-2.5 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={sending || !name.trim() || !email.trim() || !message.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] disabled:opacity-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

// ── Main Contact section ──────────────────────────────────────────────────────
export function Contact() {
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    apiClient.get<{ data: SocialLink[] }>('/socials')
      .then(({ data }) => setSocials((data.data ?? []).filter((s) => s.showInContact)))
      .catch(() => {});
  }, []);
  return (
    <section aria-labelledby="contact-heading" className="py-20 border-t border-[var(--color-border)]">

      {/* Workflow pipeline */}
      <WorkflowPipeline />

      {/* Heading */}
      <div className="mb-10">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Reach Out
        </p>
        <h2
          id="contact-heading"
          className="mb-3 text-4xl font-black text-[var(--color-text)] sm:text-5xl"
        >
          Send a Message
        </h2>
        <p className="max-w-lg text-sm text-[var(--color-muted)] leading-relaxed">
          Open to freelance software, web, and desktop contracts. Include project
          scope, timeline, and preferred tech stack for a fast response.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

        {/* ── Left: form card ─────────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-3"
          variants={slideLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-lg">✉️</span>
              <h3 className="text-base font-bold text-[var(--color-text)]">Send a Message</h3>
            </div>
            <ContactForm />
          </div>
        </motion.div>

        {/* ── Right: social links ─────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-2 flex flex-col gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Or reach me directly
          </p>
          {socials.map((s) => {
              const isExternal = s.url.startsWith('http');
              return (
                <motion.a
                  key={s._id}
                  href={s.url}
                  variants={slideRight}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 no-underline transition-colors duration-200 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-2)]"
                >
                  <span className="text-lg" aria-hidden>
                    <SocialIcon platform={s.platform} emoji={s.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">{s.label}</p>
                    <p className="truncate text-xs font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
                      {s.url.replace(/^mailto:|^tel:/, '')}
                    </p>
                  </div>
                  {isExternal && (
                    <span aria-hidden className="shrink-0 text-xs text-[var(--color-muted)] group-hover:text-[var(--color-accent)]">↗</span>
                  )}
                </motion.a>
              );
            })}

          {/* Freelance note */}
          <motion.div variants={fadeUp} className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">Working with me</p>
            <ul className="space-y-1.5 list-none p-0 m-0">
              {[
                'Project-based freelance & prototype work',
                'Web, desktop & local digitisation projects',
                'Education-focused software solutions',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
