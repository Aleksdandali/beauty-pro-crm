'use client';

import { forwardRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SlideUpProps {
  children: React.ReactNode;
  /** Controls visibility / triggers animation */
  show: boolean;
  /** Animation duration in seconds. Default: 0.3 */
  duration?: number;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SlideUp = forwardRef<HTMLDivElement, SlideUpProps>(
  ({ children, show, duration = 0.3, className }, ref) => {
    const prefersReduced = useReducedMotion();

    // Reduced motion: instant show/hide
    if (prefersReduced) {
      return show ? (
        <div ref={ref} className={className}>
          {children}
        </div>
      ) : null;
    }

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ y: '100%', opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration,
              },
            }}
            exit={{
              y: '100%',
              opacity: 0,
              transition: { duration: duration * 0.7 },
            }}
            className={cn('will-change-[opacity,transform]', className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SlideUp.displayName = 'SlideUp';
