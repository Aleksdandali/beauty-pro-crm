'use client';

import { forwardRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

// ─── Types ───────────────────────────────────────────────────────────────────

type AccentColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatCardProps {
  /** Label below the number */
  title: string;
  /** The stat value (number or pre-formatted string) */
  value: string | number;
  /** Prefix before the value, e.g. "₴" */
  prefix?: string;
  /** Suffix after the value, e.g. "%", "год" */
  suffix?: string;
  /** Icon displayed in accent-colored container */
  icon?: React.ReactNode;
  /** Trend indicator with percentage change */
  trend?: {
    value: number;
    label?: string;
  };
  /** Show skeleton loading state */
  loading?: boolean;
  className?: string;
  /** Accent color for icon bg and glow. Default: 'primary' */
  accentColor?: AccentColor;
  /** Card size variant. Default: 'md' */
  size?: 'sm' | 'md' | 'lg';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format number with space as thousands separator: 47250 → "47 250" */
function formatNumber(value: string | number): string {
  if (typeof value === 'string') return value;
  return value.toLocaleString('uk-UA').replace(/,/g, ' ');
}

// Color maps using CSS variables
const accentBgMap: Record<AccentColor, string> = {
  primary: 'bg-primary-light',
  success: 'bg-success-light',
  warning: 'bg-warning-light',
  error: 'bg-error-light',
  info: 'bg-info-light',
};

const accentTextMap: Record<AccentColor, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

const valueSizeMap: Record<NonNullable<StatCardProps['size']>, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StatCardSkeleton({ size = 'md' }: { size?: StatCardProps['size'] }) {
  const valueH = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-10' : 'h-8';

  return (
    <div className="flex flex-col gap-3">
      {/* Icon skeleton */}
      <div className="animate-shimmer h-10 w-10 rounded-lg" />
      {/* Value skeleton */}
      <div className={cn('animate-shimmer w-28 rounded-md', valueH)} />
      {/* Title skeleton */}
      <div className="animate-shimmer h-4 w-20 rounded-md" />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      prefix,
      suffix,
      icon,
      trend,
      loading = false,
      className,
      accentColor = 'primary',
      size = 'md',
    },
    ref
  ) => {
    const isPositive = trend ? trend.value >= 0 : true;
    const formattedValue = formatNumber(value);

    return (
      <GlassCard
        ref={ref}
        padding="none"
        className={cn(
          'flex h-full flex-col',
          size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6 sm:p-8' : 'p-5 sm:p-6',
          className
        )}
      >
        {loading ? (
          <StatCardSkeleton size={size} />
        ) : (
          <>
            {/* Icon */}
            {icon && (
              <div
                className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                  accentBgMap[accentColor],
                  accentTextMap[accentColor]
                )}
              >
                {icon}
              </div>
            )}

            {/* Value */}
            <p className={cn('font-mono-numbers text-foreground font-bold', valueSizeMap[size])}>
              {prefix && <span className="text-text-secondary mr-0.5">{prefix}</span>}
              {formattedValue}
              {suffix && (
                <span className="text-text-secondary ml-1 text-[0.6em] font-medium">{suffix}</span>
              )}
            </p>

            {/* Title + Trend row */}
            <div className="mt-auto flex items-center gap-2 pt-2">
              <p className="text-text-secondary text-sm font-medium">{title}</p>

              {trend && (
                <div
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
                    'font-mono-numbers text-xs font-medium',
                    isPositive ? 'bg-success-light text-success' : 'bg-error-light text-error'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {trend.value}%
                  </span>
                </div>
              )}
            </div>

            {/* Trend label */}
            {trend?.label && <p className="text-text-muted mt-0.5 text-xs">{trend.label}</p>}
          </>
        )}
      </GlassCard>
    );
  }
);

StatCard.displayName = 'StatCard';
