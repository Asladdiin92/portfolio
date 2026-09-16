import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import profileImg from '../assets/profile.png';
import { apiClient } from '../lib/apiClient';
import { SocialIcon, PLATFORM_COLORS } from './SocialIcon';
import { fadeUp, fadeIn, slideLeft, slideRight, staggerContainer, scaleIn } from '../lib/motion';

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigMap = Record<string, string>;
interface SocialLink {
  _id: string; label: string; url: string;
  platform: string; icon: string;
  showInHero: boolean; visible: boolean;
}

// ── Defaults (used when config key is empty) ──────────────────────────────────
const D = {
  nameFirst:      'Asladdiin',
  nameLast:       'Abduqaadir',
  badge:          'Open to freelance & opportunities',
  tags:           'IT Student · FREELANCE · Community Builder',
  bio:            'Building practical web, desktop & local-tech solutions from Oromia, Ethiopia — software that makes a real difference in the community.',
  typewriterWords:'Developer,Builder,Problem Solver,Student,Freelancer',
  ctaPrimary:     'View projects',
  ctaSecondary:   'Gallery',
  badges:         ['Java', 'React', 'Node.js', 'GIS'],
};

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const word = words[wordIdx % words.length];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length)
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    else if (!deleting && displayed.length === word.length)
      t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, wordIdx, words]);

  return (
    <span className="gradient-role text-5xl font-black uppercase tracking-wider sm:text-6xl lg:text-7xl">
      {displayed}
      <span className="typewriter-cursor text-[var(--color-accent)]" aria-hidden />
    </span>
  );
}

// ── Star field ────────────────────────────────────────────────────────────────
function StarField() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.innerHTML = '';
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      const sz = Math.random() * 2.5 + 0.5;
      s.className = 'star';
      s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--duration:${Math.random()*5+3}s;--delay:${Math.random()*6}s;--max-opacity:${Math.random()*0.5+0.2};`;
      c.appendChild(s);
    }
  }, []);
  return <div ref={ref} className="stars-field" aria-hidden />;
}

// ── Parallax background ───────────────────────────────────────────────────────
function ParallaxBackground({ imageUrl }: { imageUrl: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const bgX = useTransform(springX, [-1, 1], ['-4%', '4%']);
  const bgY = useTransform(springY, [-1, 1], ['-4%', '4%']);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  if (!imageUrl) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ x: bgX, y: bgY, width: '108%', height: '108%', left: '-4%', top: '-4%' }}
    >
      {/* Full-screen photo */}
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-cover object-top"
        style={{ filter: 'brightness(0.18) saturate(0.6)' }}
      />
      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1117]/60 via-transparent to-[#0f1117]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117]/50 via-transparent to-[#0f1117]/50" />
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const [config, setConfig]   = useState<ConfigMap>({});
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    apiClient.get<{ data: ConfigMap }>('/config')
      .then(({ data }) => setConfig(data.data ?? {}))
      .catch(() => {});
    apiClient.get<{ data: SocialLink[] }>('/socials')
      .then(({ data }) => setSocials((data.data ?? []).filter((s) => s.showInHero)))
      .catch(() => {});
  }, []);

  // Resolve config values with fallbacks
  const nameFirst  = config['hero_name_first']       || D.nameFirst;
  const nameLast   = config['hero_name_last']        || D.nameLast;
  const badge      = config['hero_badge']            || D.badge;
  const tags       = config['hero_tags']             || D.tags;
  const bio        = config['hero_bio']              || D.bio;
  const ctaPrimary = config['hero_cta_primary']      || D.ctaPrimary;
  const ctaSecondary = config['hero_cta_secondary']  || D.ctaSecondary;
  const profileUrl = config['hero_profile_image'] || '';
  const bgUrl      = config['hero_bg_image']      || '';
  const words      = (config['hero_typewriter_words'] || D.typewriterWords)
    .split(',').map((w) => w.trim()).filter(Boolean);

  const photoBadges = [
    { text: config['hero_badge1'] || D.badges[0], pos: 'top-3 -left-10',      rot: '-6deg', delay: '0s'   },
    { text: config['hero_badge2'] || D.badges[1], pos: 'top-3 -right-10',     rot: '5deg',  delay: '0.5s' },
    { text: config['hero_badge3'] || D.badges[2], pos: '-bottom-3 -left-8',   rot: '4deg',  delay: '1s'   },
    { text: config['hero_badge4'] || D.badges[3], pos: 'bottom-10 -right-10', rot: '-4deg', delay: '1.5s' },
  ];

  // Parse bold segments from bio (**text** → <strong>)
  const bioParts = bio.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-[var(--color-text)]">{part.slice(2, -2)}</strong>
      : part
  );

  return (
    <section aria-label="Introduction" className="relative flex min-h-[90vh] items-center py-12 sm:py-20">

      {/* Full-screen parallax background (separate background image) */}
      <ParallaxBackground imageUrl={bgUrl} />

      {/* Star field (shown when no image or over the image) */}
      <StarField />

      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-10 h-[400px] w-[400px] rounded-full bg-purple-700/10 blur-[100px]" />
      </div>

      <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2">

        {/* ── Left column ──────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Status badge */}
          <motion.div variants={fadeIn} className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-1.5 backdrop-blur-sm">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]" />
            <span className="text-xs font-medium text-[var(--color-muted)]">{badge}</span>
          </motion.div>

          {/* Name */}
          <motion.h1 variants={slideLeft} className="mb-2 leading-none tracking-tight">
            <span className="gradient-name block text-6xl font-black sm:text-7xl lg:text-8xl">{nameFirst}</span>
            <span className="block text-3xl font-bold text-[var(--color-muted)] sm:text-4xl">{nameLast}</span>
          </motion.h1>

          {/* Role tags */}
          <motion.div variants={fadeUp} className="my-4 flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            {tags.split('·').map((t, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className={t.trim().toUpperCase() === t.trim() && t.trim().length > 2 ? 'text-[var(--color-accent)] font-bold' : ''}>
                  {t.trim()}
                </span>
                {i < arr.length - 1 && <span className="text-[var(--color-accent)]">·</span>}
              </span>
            ))}
          </motion.div>

          {/* Bio */}
          <motion.p variants={fadeUp} className="mb-6 max-w-lg text-base text-[var(--color-muted)] leading-relaxed">
            {bioParts}
          </motion.p>

          {/* Typewriter */}
          <motion.div variants={fadeUp} className="mb-8 flex h-20 items-center" aria-live="polite" aria-label="Current role">
            <Typewriter words={words} />
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/projects"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white no-underline shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)]">
                {ctaPrimary} <span aria-hidden>→</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/gallery"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-[var(--color-text)] no-underline transition-all duration-200 hover:border-[var(--color-accent)]/60 hover:text-[var(--color-accent)]">
                {ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>

          {/* Social icons */}
          <motion.nav variants={staggerContainer} aria-label="Social links" className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <motion.a
                key={s._id}
                href={s.url}
                variants={scaleIn}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.92 }}
                aria-label={s.label}
                className="social-btn"
                style={{ '--social-color': PLATFORM_COLORS[s.platform] ?? '#6366f1' } as React.CSSProperties}
                {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <SocialIcon platform={s.platform} emoji={s.icon} size={16} />
              </motion.a>
            ))}
          </motion.nav>
        </motion.div>

        {/* ── Right column — photo card ───────────────────────────────── */}
        <motion.div
          className="flex justify-center lg:justify-end"
          variants={slideRight}
          initial="hidden"
          animate="show"
        >
          <div className="relative">
            <div aria-hidden className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-[var(--color-accent)]/30 via-purple-600/20 to-transparent blur-2xl" />

            <motion.div
              className="photo-card relative z-10 overflow-hidden rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
              whileHover={{ rotate: 0, scale: 1.02 }}
            >
              <img
                src={profileUrl || profileImg}
                alt={`${nameFirst} ${nameLast}`}
                className="block max-h-[420px] w-auto max-w-full object-contain object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-xs font-semibold text-white/90">Haramaya University</p>
                <p className="text-[10px] text-white/60">Oromia, Ethiopia</p>
              </div>
            </motion.div>

            {photoBadges.map(({ text, pos, rot, delay }) => (
              <motion.span
                key={pos}
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parseFloat(delay) + 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ '--rot': rot, animationDelay: delay } as React.CSSProperties}
                className={`float-badge absolute ${pos} z-20 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3 py-1 text-xs font-semibold text-[var(--color-accent)] backdrop-blur-sm shadow-[var(--shadow-card)]`}
              >
                {text}
              </motion.span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
