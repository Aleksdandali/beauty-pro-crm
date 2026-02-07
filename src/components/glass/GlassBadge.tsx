'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  // RFM segments
  | 'vip'
  | 'loyal'
  | 'regular'
  | 'new'
  | 'sleeping'
  | 'lost';

interface GlassBadgeProps {
  children: React.ReactNode;
  /** Visual style variant. Default: 'default' */
  variant?: BadgeVariant;
  /** Badge size. Default: 'sm' */
  size?: 'sm' | 'md';
  /** Show a colored dot indicator on the left */
  dot?: boolean;
  className?: string;
}

// ─── Variant Styles ──────────────────────────────────────────────────────────

// Status variants: subtle bg + colored text
const statusStyles: Record<string, string> = {
  default: 'bg-[var(--surface)] text-text-secondary border border-[var(--glass-border)]',
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error: 'bg-error-light text-error',
  info: 'bg-info-light text-info',
};

// Dot colors
const dotStyles: Record<string, string> = {
  default: 'bg-text-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  vip: 'bg-[#F59E0B]',
  loyal: 'bg-[#8B5CF6]',
  regular: 'bg-[#10B981]',
  new: 'bg-[#3B82F6]',
  sleeping: 'bg-[#F97316]',
  lost: 'bg-[#6B7280]',
};

// RFM gradient variants — use CSS custom properties
const rfmGradients: Record<string, string> = {
  vip: 'var(--gradient-rfm-vip)',
  loyal: 'var(--gradient-rfm-loyal)',
  regular: 'var(--gradient-rfm-regular)',
  new: 'var(--gradient-rfm-new)',
  sleeping: 'var(--gradient-rfm-sleeping)',
  lost: 'var(--gradient-rfm-lost)',
};

const RFM_VARIANTS = new Set(['vip', 'loyal', 'regular', 'new', 'sleeping', 'lost']);

// ─── Size Styles ─────────────────────────────────────────────────────────────

const sizeStyles: Record<NonNullable<GlassBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs sm:text-sm',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ children, variant = 'default', size = 'sm', dot = false, className }, ref) => {
    const isRfm = RFM_VARIANTS.has(variant);

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight',
          sizeStyles[size],
          // RFM: gradient bg + white text; Status: subtle bg + colored text
          isRfm ? 'text-white' : statusStyles[variant],
          className
        )}
        style={isRfm ? { background: rfmGradients[variant] } : undefined}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotStyles[variant])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = 'GlassBadge';
