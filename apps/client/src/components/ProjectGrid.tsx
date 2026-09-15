import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@portfolio/shared';
import { staggerContainer, fadeUp } from '../lib/motion';

type ProjectDocument = Project & { _id: string };

interface ApiResponse {
  success: boolean;
  count: number;
  data: ProjectDocument[];
}

export function ProjectGrid() {
  const [projects, setProjects]   = useState<ProjectDocument[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [activeTech, setActiveTech] = useState('All');

  // Fetch projects from the API
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get<ApiResponse>('/projects');
        if (!cancelled) setProjects(data.data ?? []);
      } catch {
        if (!cancelled) setError('Failed to load projects. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Derive unique tech tags from all projects
  const allTechs = useMemo(
    () => ['All', ...Array.from(new Set(projects.flatMap((p) => p.techStack))).sort()],
    [projects]
  );

  // Filter by search + active tech tag
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchTech =
        activeTech === 'All' || p.techStack.includes(activeTech);
      return matchSearch && matchTech;
    });
  }, [projects, search, activeTech]);

  return (
    <section aria-label="Projects">
      {/* Section header */}
      <motion.div
        className="mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h2 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Projects</h2>
        <p className="text-sm text-[var(--color-muted)]">
          {projects.length} project{projects.length !== 1 ? 's' : ''} in the portfolio
        </p>
      </motion.div>

      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4">
        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          aria-label="Search projects"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] sm:max-w-sm"
        />

        {/* Tech filter chips */}
        <div
          role="group"
          aria-label="Filter by technology"
          className="flex flex-wrap gap-2"
        >
          {allTechs.map((tech) => {
            const active = tech === activeTech;
            return (
              <button
                key={tech}
                type="button"
                onClick={() => setActiveTech(tech)}
                aria-pressed={active}
                className={[
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150',
                  active
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text)]',
                ].join(' ')}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-48 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">
          No projects match your filters.
        </p>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <motion.ul
          className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Project list"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {filtered.map((project) => (
            <li key={project._id} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
