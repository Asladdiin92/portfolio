import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { fadeUp, slideLeft, staggerContainer, scaleIn } from '../lib/motion';

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigMap = Record<string, string>;

// ── Data ──────────────────────────────────────────────────────────────────────
const skillDomains = [
  {
    label: 'Languages & Frameworks',
    items: ['Java', 'PHP (MySQLi)', 'JavaScript', 'HTML5', 'CSS3', 'C++', 'Visual Basic .NET', 'React', 'Node.js', 'Express.js'],
  },
  {
    label: 'Databases',
    items: ['MySQL', 'MariaDB', 'Supabase'],
  },
  {
    label: 'Environments & Tools',
    items: ['NetBeans IDE', 'Visual Studio', 'XAMPP / LAMP Stack', 'Git', 'GitHub', 'VS Code'],
  },
  {
    label: 'GIS & Remote Sensing',
    items: ['Google Earth Engine', 'QGIS', 'ArcGIS', 'Landsat / Sentinel Imagery'],
  },
];

const coursework = [
  'Object-Oriented Programming (Java / C++)',
  'Database Systems & Advanced Programming',
  'Web & Mobile Application Development',
  'Networking & Computer System Architecture',
  'IT Project Management',
];

const values = [
  {
    key: 'card_img_growth',
    label: 'GROWTH',
    color: '#06b6d4',
    text: 'An explorer of systems — self-taught from a phone on Termux to full Linux dev environments.',
  },
  {
    key: 'card_img_focus',
    label: 'FOCUS',
    color: '#8b5cf6',
    text: 'Deep work on efficiency and precision in every layer built — web, desktop, and GIS.',
  },
  {
    key: 'card_img_craft',
    label: 'CRAFT',
    color: '#f59e0b',
    text: 'Discipline and dedication in every line of code. Build. Learn. Share. Improve. Repeat.',
  },
];

// ── Hover image overlay wrapper ───────────────────────────────────────────────
/**
 * Wraps a card and shows an image as a semi-transparent overlay on hover.
 * If no imageUrl is set, renders children unchanged.
 */
function HoverImageCard({
  imageUrl,
  children,
  className = '',
}: {
  imageUrl?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {children}
      {imageUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          {/* Image */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Dark gradient so text stays readable on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LocationCard({ imageUrl }: { imageUrl?: string }) {
  return (
    <HoverImageCard
      imageUrl={imageUrl}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="relative z-20 p-6">
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          📍 Location · Oromia, Ethiopia
        </p>
        <p className="text-3xl font-black text-[var(--color-text)] tracking-tight">OROMIA</p>
        <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">8.5500° N, 39.2700° E</p>
        <p className="font-mono text-xs text-[var(--color-muted)]">EAT · UTC+3</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {['Haramaya University', 'Ethiopia', 'Open to Remote'].map((tag) => (
            <span key={tag} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </HoverImageCard>
  );
}

function BioCard({ imageUrl }: { imageUrl?: string }) {
  return (
    <HoverImageCard
      imageUrl={imageUrl}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="relative z-20 p-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">/ About</p>
        <div className="space-y-3 text-sm text-[var(--color-muted)] leading-relaxed">
          <p>
            I'm <span className="font-semibold text-[var(--color-text)]">Asladdiin Abduqaadir</span> — an IT student at Haramaya University, freelance developer, and community-minded problem solver from Oromia, Ethiopia.
          </p>
          <p>
            My journey started with mobile-first development on Termux — building real software with nothing but a phone. That self-taught grit pushed me into full-stack web, desktop apps, and GIS tooling.
          </p>
          <p>
            I care deeply about education-focused software and solutions that make a real difference in local communities.
          </p>
        </div>
        <blockquote className="mt-4 border-l-2 border-[var(--color-accent)] pl-3 text-xs italic text-[var(--color-muted)]">
          "Build. Learn. Share. Improve. Repeat."
        </blockquote>
      </div>
    </HoverImageCard>
  );
}

function LearningCard({ imageUrl }: { imageUrl?: string }) {
  const items = ['Software Architecture', 'System Design', 'Advanced Data Structures'];
  return (
    <HoverImageCard
      imageUrl={imageUrl}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="relative z-20 p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          🌱 Currently Learning
        </p>
        <ul className="space-y-2 list-none p-0 m-0">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-muted)]">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </HoverImageCard>
  );
}

function EducationCard({ imageUrl }: { imageUrl?: string }) {
  return (
    <HoverImageCard
      imageUrl={imageUrl}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="relative z-20 p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          🎓 Education
        </p>
        <div className="mb-1 flex items-start justify-between gap-3">
          <span className="font-semibold text-sm text-[var(--color-text)]">Haramaya University</span>
          <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[10px] text-[var(--color-muted)]">4th Year</span>
        </div>
        <p className="mb-4 text-xs text-[var(--color-muted)]">B.Sc. Information Technology · Oromia, Ethiopia</p>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">Relevant Coursework</p>
        <ul className="space-y-1.5 list-none p-0 m-0">
          {coursework.map((course) => (
            <li key={course} className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
              <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {course}
            </li>
          ))}
        </ul>
      </div>
    </HoverImageCard>
  );
}

function ValueCards({ config }: { config: ConfigMap }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {values.map(({ key, label, color, text }) => (
        <motion.div key={key} variants={scaleIn} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
          <HoverImageCard
            imageUrl={config[key]}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] h-full"
          >
            <div
              className="relative z-20 p-5"
              style={{ borderTopColor: color, borderTopWidth: '2px', borderTopStyle: 'solid' }}
            >
              <p className="mb-2 text-xs font-bold tracking-widest" style={{ color }}>{label}</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">{text}</p>
            </div>
          </HoverImageCard>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function About() {
  const [config, setConfig] = useState<ConfigMap>({});

  useEffect(() => {
    apiClient.get<{ data: ConfigMap }>('/config')
      .then(({ data }) => setConfig(data.data ?? {}))
      .catch(() => { /* config is optional — fail silently */ });
  }, []);

  return (
    <section aria-labelledby="about-heading" className="py-20 border-t border-[var(--color-border)]">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        Who I Am
      </p>
      <h2
        id="about-heading"
        className="mb-12 text-4xl font-black text-[var(--color-text)] sm:text-5xl"
      >
        About Me
      </h2>

      {/* Row 1 — Location + Bio */}
      <motion.div
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.div variants={slideLeft}><LocationCard imageUrl={config['card_img_location']} /></motion.div>
        <motion.div variants={fadeUp}><BioCard imageUrl={config['card_img_about']} /></motion.div>
      </motion.div>

      {/* Row 2 — Learning + Education */}
      <motion.div
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.div variants={fadeUp}><LearningCard imageUrl={config['card_img_learning']} /></motion.div>
        <motion.div variants={fadeUp}><EducationCard imageUrl={config['card_img_education']} /></motion.div>
      </motion.div>

      {/* Row 3 — Value cards */}
      <motion.div
        className="mb-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        <ValueCards config={config} />
      </motion.div>

      {/* Row 4 — Skills */}
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Skills by domain
        </p>
        {skillDomains.map(({ label, items }) => (
          <motion.div variants={fadeUp} key={label} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="mb-3 text-xs font-semibold text-[var(--color-text)]">{label}</p>
            <ul aria-label={`${label} skills`} className="flex flex-wrap gap-2 list-none p-0 m-0">
              {items.map((item) => (
                <li key={item} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs text-[var(--color-muted)] transition-colors duration-150 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text)]">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
