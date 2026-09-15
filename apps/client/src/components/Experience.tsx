import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { fadeUp, slideLeft, slideRight, staggerContainer } from '../lib/motion';

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigMap = Record<string, string>;

// ── Data ──────────────────────────────────────────────────────────────────────

interface EducationEntry {
  period: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  photo?: string; // optional campus photo URL
}

interface WorkEntry {
  period: string;
  role: string;
  company: string;
  companyColor: string;
  description: string;
  techStack: string[];
  icon: string;
}

const education: EducationEntry[] = [
  {
    period: '2022 — Present',
    degree: 'Bachelor of Science',
    field: 'Information Technology',
    institution: 'Haramaya University',
    location: 'Oromia, Ethiopia',
  },
];

const work: WorkEntry[] = [
  {
    period: 'Industrial Practice · 2024',
    role: 'Software Developer (Industrial Practice)',
    company: 'Haramaya University IT Dept.',
    companyColor: '#06b6d4',
    description:
      'Completed industrial practice attachment building internal software tools and inventory management systems. Worked on desktop application development, database integration, and practical system deployment.',
    techStack: ['Java', 'MySQL', 'NetBeans', 'JDBC', 'XAMPP'],
    icon: '🏛️',
  },
  {
    period: 'Freelance · 2023 — Present',
    role: 'Freelance Full-Stack Developer',
    company: 'Self-Employed · Remote',
    companyColor: '#f59e0b',
    description:
      'Building web and desktop solutions for clients — department guidance systems, hotel management software, and community-focused digitisation projects. Open to software, web, and desktop contracts.',
    techStack: ['React', 'Node.js', 'Express.js', 'Supabase', 'Java', 'PHP', 'MySQL'],
    icon: '💼',
  },
];

// ── Campus photo card (left side) ─────────────────────────────────────────────
function EducationColumn({ campusPhoto }: { campusPhoto?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        Education & Work
      </p>
      <h2 className="text-4xl font-black text-[var(--color-text)] sm:text-5xl leading-tight">
        Experience
      </h2>

      {education.map((ed) => (
        <div key={ed.institution} className="space-y-4">
          {/* Timeline dot + period */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
            />
            <span className="font-mono text-xs text-cyan-400">{ed.period}</span>
          </div>

          {/* Degree info */}
          <div className="pl-6">
            <p className="text-base font-bold text-[var(--color-text)]">{ed.degree}</p>
            <p className="text-sm text-[var(--color-muted)]">{ed.field}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{ed.institution}</p>
            <p className="text-xs text-[var(--color-muted)]/60">{ed.location}</p>
          </div>

          {/* Campus photo */}
          <div className="pl-6">
            <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {campusPhoto || ed.photo ? (
                <img
                  src={campusPhoto || ed.photo}
                  alt={`${ed.institution} campus`}
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                /* Placeholder when no photo is set */
                <div className="flex h-52 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)]">
                  <span className="text-4xl" aria-hidden>🎓</span>
                  <p className="text-xs text-[var(--color-muted)]">Haramaya University</p>
                  <p className="text-[10px] text-[var(--color-muted)]/60">Oromia, Ethiopia</p>
                </div>
              )}
              {/* Bottom label overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-xs font-semibold text-white">{ed.institution}</p>
                <p className="text-[10px] text-white/60">{ed.location}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Work experience cards (right side) ────────────────────────────────────────
function WorkColumn() {
  return (
    <div className="flex flex-col gap-5 pt-0 lg:pt-28">
      {work.map((job) => (
        <motion.div
          key={job.role}
          variants={slideRight}
          whileHover={{ x: 4, transition: { duration: 0.2 } }}
          className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
        >
          {/* Top row — period + icon */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: job.companyColor }}
            >
              {job.period}
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ background: `${job.companyColor}20`, border: `1px solid ${job.companyColor}40` }}
              aria-hidden
            >
              {job.icon}
            </span>
          </div>

          {/* Role */}
          <h3 className="mb-1 text-base font-bold text-[var(--color-text)] leading-snug">
            {job.role}
          </h3>

          {/* Company */}
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: job.companyColor }}
          >
            {job.company}
          </p>

          {/* Description */}
          <p className="mb-4 text-sm text-[var(--color-muted)] leading-relaxed">
            {job.description}
          </p>

          {/* Tech stack chips */}
          <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
            {job.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>

          {/* Accent left border on hover */}
          <div
            className="absolute inset-y-0 left-0 w-0.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ background: job.companyColor }}
            aria-hidden
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function Experience() {
  const [config, setConfig] = useState<ConfigMap>({});

  useEffect(() => {
    apiClient.get<{ data: ConfigMap }>('/config')
      .then(({ data }) => setConfig(data.data ?? {}))
      .catch(() => {});
  }, []);

  return (
    <section
      aria-labelledby="experience-heading"
      className="py-20 border-t border-[var(--color-border)]"
    >
      <h2 id="experience-heading" className="sr-only">Experience</h2>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <motion.div
          variants={slideLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <EducationColumn campusPhoto={config['exp_campus_photo']} />
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <WorkColumn />
        </motion.div>
      </div>
    </section>
  );
}
