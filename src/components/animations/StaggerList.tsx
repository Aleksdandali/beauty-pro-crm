'use client';

import { forwardRef, Children, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StaggerListProps {
  children: React.ReactNode;
  /** Delay between each child in seconds. Default: 0.08 */
  delay?: number;
  /** Delay before the first child in seconds. Default: 0 */
  initialDelay?: number;
  /** Slide direction for each child. Default: 'up' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Slide distance in pixels. Default: 15 */
  distance?: number;
  className?: string;
  /** Only animate once. Default: true */
  once?: boolean;
}

// ─── Direction → offset ──────────────────────────────────────────────────────

function getOffset(direction: StaggerListProps['direction'], distance: number) {
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

export const StaggerList = forwardRef<HTMLDivElement, StaggerListProps>(
  (
    {
      children,
      delay = 0.08,
      initialDelay = 0,
      direction = 'up',
      distance = 15,
      className,
      once = true,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;
    const isInView = useInView(resolvedRef, { once, margin: '-40px' });
    const prefersReduced = useReducedMotion();

    const offset = getOffset(direction, distance);
    const items = Children.toArray(children);

    // Reduced motion: render without animation
    if (prefersReduced) {
      return (
        <div ref={resolvedRef} className={className}>
          {children}
        </div>
      );
    }

    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: delay,
          delayChildren: initialDelay,
        },
      },
    };

    const itemVariants = {
      hidden: {
        opacity: 0,
        x: offset.x,
        y: offset.y,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1] as const,
        },
      },
    };

    return (
      <motion.div
        ref={resolvedRef}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className={cn('will-change-[opacity,transform]', className)}
      >
        {items.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }
);

StaggerList.displayName = 'StaggerList';
