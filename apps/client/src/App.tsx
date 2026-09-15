import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { RequireAuth } from './components/RequireAuth';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectDetail } from './components/ProjectDetail';
import { GalleryPage } from './pages/GalleryPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// ── Pages ─────────────────────────────────────────────────────────────────────

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <section aria-label="Recent projects" className="mt-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Recent projects
          </h2>
          <a
            href="/projects"
            className="text-sm text-[var(--color-accent)] no-underline hover:text-[var(--color-accent-hover)]"
          >
            View all →
          </a>
        </div>
        <ProjectGrid />
      </section>
      <Contact />
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-2 text-6xl font-bold text-[var(--color-accent)]">404</p>
      <h1 className="mb-4 text-2xl font-semibold text-[var(--color-text)]">Page not found</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-[var(--color-accent-hover)]"
      >
        Go home
      </a>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectGrid />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="login" element={<LoginPage />} />

            {/* Protected admin route */}
            <Route
              path="admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            {/* Catch-all */}
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
