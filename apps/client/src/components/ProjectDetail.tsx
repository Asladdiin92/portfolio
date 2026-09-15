import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../lib/apiClient';
import type { Project } from '@portfolio/shared';

type ProjectDocument = Project & { _id: string; createdAt: string };

interface ApiResponse {
  success: boolean;
  data: ProjectDocument;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get<ApiResponse>(`/projects/${id}`);
        if (!cancelled) setProject(data.data);
      } catch {
        if (!cancelled) setError('Project not found or failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading project" className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-[var(--color-surface)]" />
        <div className="h-8 w-2/3 rounded bg-[var(--color-surface)]" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-[var(--color-surface)]" />
          ))}
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-4 rounded bg-[var(--color-surface)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--color-surface)]" />
          <div className="h-4 w-4/6 rounded bg-[var(--color-surface)]" />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !project) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error ?? 'Project not found.'}
        </p>
        <Link
          to="/projects"
          className="text-sm text-[var(--color-accent)] no-underline hover:text-[var(--color-accent-hover)]"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  const publishedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <article aria-label={project.title}>
      {/* Back link */}
      <Link
        to="/projects"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] no-underline transition-colors duration-150 hover:text-[var(--color-accent)]"
      >
        <span aria-hidden="true">←</span> Back to projects
      </Link>

      {/* Header */}
      <header className="mb-8 mt-4">
        {project.featured && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            Featured project
          </span>
        )}

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
          {project.title}
        </h1>

        <p className="mb-4 text-base text-[var(--color-muted)]">
          Published {publishedDate}
        </p>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <ul
            aria-label="Technologies used"
            className="flex flex-wrap gap-2 list-none p-0 m-0"
          >
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Divider */}
      <hr className="mb-8 border-[var(--color-border)]" />

      {/* Links row */}
      {(project.githubUrl || project.liveUrl) && (
        <div className="mb-8 flex flex-wrap gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] no-underline transition-colors duration-150 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
            >
              GitHub repository ↗
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-[var(--color-accent-hover)]"
            >
              Live demo ↗
            </a>
          )}
        </div>
      )}

      {/* Markdown content — falls back to plain description if no markdown body */}
      <div className="prose prose-sm sm:prose-base max-w-none">
        <ReactMarkdown>
          {project.description}
        </ReactMarkdown>
      </div>
    </article>
  );
}
