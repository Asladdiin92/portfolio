/**
 * Shared Framer Motion variants.
 * Import these anywhere in the app for consistent animation behaviour.
 */
import type { Variants } from 'framer-motion';

// ── Base easing ───────────────────────────────────────────────────────────────
export const EASE = [0.25, 0.1, 0.25, 1] as const;
export const EASE_OUT = [0, 0, 0.2, 1] as const;
export const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

// ── Fade up — most-used scroll reveal ────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE_OUT } },
};

// ── Fade in (no movement) ─────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

// ── Slide in from left ────────────────────────────────────────────────────────
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.6, ease: EASE_OUT } },
};

// ── Slide in from right ───────────────────────────────────────────────────────
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

// ── Scale in ──────────────────────────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ── Stagger container — wraps a list of children ─────────────────────────────
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren:  0.1,
      delayChildren:    0.05,
    },
  },
};

// ── Stagger container (faster) ────────────────────────────────────────────────
export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren:   0.02,
    },
  },
};

// ── Card hover ────────────────────────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0,  scale: 1,    boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
  hover: { y: -5, scale: 1.01, boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
           transition: { duration: 0.25, ease: EASE } },
};

// ── Button tap ────────────────────────────────────────────────────────────────
export const tapScale = { whileTap: { scale: 0.96 } };
