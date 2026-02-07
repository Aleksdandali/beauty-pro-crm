'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── BentoGrid Types ─────────────────────────────────────────────────────────

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns. Default: responsive (1→2→3→4) */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items. Default: 'md' */
  gap?: 'sm' | 'md' | 'lg';
}

const gapStyles: Record<NonNullable<BentoGridProps['gap']>, string> = {
  sm: 'gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-5',
  lg: 'gap-4 sm:gap-5 lg:gap-6',
};

const columnStyles: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// ─── BentoGrid Component ────────────────────────────────────────────────────

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ children, className, columns, gap = 'md' }, ref) => {
    // Default responsive: 1 col mobile → 2 tablet → 3 desktop → 4 wide
    const colClass = columns
      ? columnStyles[columns]
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
      <div ref={ref} className={cn('grid w-full', colClass, gapStyles[gap], className)}>
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = 'BentoGrid';

// ─── BentoItem Types ─────────────────────────────────────────────────────────

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns to span. Default: 1 */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows to span. Default: 1 */
  rowSpan?: 1 | 2;
}

const colSpanStyles: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  4: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4',
};

const rowSpanStyles: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-1 sm:row-span-2',
};

// ─── BentoItem Component ────────────────────────────────────────────────────

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(
  ({ children, className, colSpan = 1, rowSpan = 1 }, ref) => {
    return (
      <div ref={ref} className={cn(colSpanStyles[colSpan], rowSpanStyles[rowSpan], className)}>
        {children}
      </div>
    );
  }
);

BentoItem.displayName = 'BentoItem';
