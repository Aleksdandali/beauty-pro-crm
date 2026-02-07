'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PageTransition = forwardRef<HTMLElement, PageTransitionProps>(
  ({ children, className }, ref) => {
    const pathname = usePathname();
    const prefersReduced = useReducedMotion();

    // Reduced motion: no animation
    if (prefersReduced) {
      return (
        <main ref={ref} className={className}>
          {children}
        </main>
      );
    }

    return (
      <motion.main
        ref={ref}
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={cn('will-change-[opacity,transform]', className)}
      >
        {children}
      </motion.main>
    );
  }
);

PageTransition.displayName = 'PageTransition';
