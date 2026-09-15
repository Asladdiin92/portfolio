import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '@portfolio/shared';
import { fadeUp } from '../lib/motion';

interface ProjectCardProps {
  project: Project & { _id: string };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6, boxShadow: '0 8px 32px rgba(99,102,241,0.25)', transition: { duration: 0.2 } }}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors duration-200 hover:border-[var(--color-accent)]/50"
    >
      {/* Featured badge */}
      {project.featured && (
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          Featured
        </span>
      )}

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold text-[var(--color-text)] leading-snug">
        {project.title}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">
        {project.description}
      </p>

      {/* Tech stack chips */}
      {project.techStack.length > 0 && (
        <ul
          aria-label="Technologies used"
          className="mb-5 flex flex-wrap gap-1.5 list-none p-0 m-0"
        >
          {project.techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to={`/projects/${project._id}`}
          className="text-sm font-medium text-[var(--color-accent)] no-underline transition-colors duration-150 hover:text-[var(--color-accent-hover)]"
          aria-label={`View details for ${project.title}`}
        >
          View details →
        </Link>

        <div className="flex gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub repository for ${project.title}`}
              className="text-xs text-[var(--color-muted)] no-underline hover:text-[var(--color-text)]"
            >
              GitHub ↗
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Live demo for ${project.title}`}
              className="text-xs text-[var(--color-muted)] no-underline hover:text-[var(--color-text)]"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
