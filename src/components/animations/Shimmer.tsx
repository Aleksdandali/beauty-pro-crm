'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShimmerProps {
  /** Width. Default: '100%' */
  width?: string | number;
  /** Height. Default: '20px' */
  height?: string | number;
  /** Border radius variant. Default: 'md' */
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

// ─── Rounded Map ─────────────────────────────────────────────────────────────

const roundedStyles: Record<NonNullable<ShimmerProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

// ─── Component ───────────────────────────────────────────────────────────────
// Pure CSS animation for performance — uses animate-shimmer from globals.css

export const Shimmer = forwardRef<HTMLDivElement, ShimmerProps>(
  ({ width = '100%', height = '20px', rounded = 'md', className }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Завантаження..."
        className={cn(
          'animate-shimmer motion-reduce:animate-none',
          roundedStyles[rounded],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      />
    );
  }
);

Shimmer.displayName = 'Shimmer';
