import { type ReactNode, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps { children?: ReactNode; }

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => navigate('/login', { replace: true });
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [navigate]);

  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="mx-auto w-full max-w-5xl flex-1 px-6 py-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children ?? <Outlet />}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
