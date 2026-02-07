'use client';

import { forwardRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ThemeToggleProps {
  className?: string;
}

// Shared button classes (used by both skeleton and real button)
const buttonClasses = [
  'relative flex h-9 w-9 items-center justify-center rounded-full',
  'border border-[var(--glass-border)] bg-[var(--glass-bg)]',
  '[backdrop-filter:blur(var(--glass-blur))] [-webkit-backdrop-filter:blur(var(--glass-blur))]',
  'text-text-secondary transition-colors duration-200',
  'hover:text-text-primary hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-hover)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(({ className }, ref) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- required for hydration-safe mount detection
  useEffect(() => setMounted(true), []);

  // Before mount: render a skeleton placeholder of the same size
  if (!mounted) {
    return (
      <div className={cn(...buttonClasses, 'animate-pulse-soft', className)} aria-hidden="true" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      ref={ref}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(...buttonClasses, className)}
      aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: 0.3,
          }}
          className="flex items-center justify-center"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
