'use client';

import { forwardRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FadeInProps {
  children: React.ReactNode;
  /** Slide direction. Default: 'up' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** Duration in seconds. Default: 0.4 */
  duration?: number;
  /** Slide distance in pixels. Default: 20 */
  distance?: number;
  /** Only animate the first time it enters viewport. Default: true */
  once?: boolean;
  className?: string;
}

// ─── Direction Offset Map ────────────────────────────────────────────────────

function getOffset(direction: FadeInProps['direction'], distance: number) {
  switch (direction) {
    case 'down':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
    case 'up':
    default:
      return { x: 0, y: distance };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      direction = 'up',
      delay = 0,
      duration = 0.4,
      distance = 20,
      once = true,
      className,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;
    const isInView = useInView(resolvedRef, { once, margin: '-40px' });
    const prefersReduced = useReducedMotion();

    const offset = getOffset(direction, distance);

    // Skip animation for reduced motion
    if (prefersReduced) {
      return (
        <div ref={resolvedRef} className={className}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={resolvedRef}
        initial={{ opacity: 0, x: offset.x, y: offset.y }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={cn('will-change-[opacity,transform]', className)}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';
