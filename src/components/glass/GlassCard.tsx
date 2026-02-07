'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type GlassCardElement = 'div' | 'section' | 'article';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'onClick'> {
  children: React.ReactNode;
  className?: string;
  /** Enable hover effect (scale + border highlight). Default: true */
  hover?: boolean;
  /** Enable violet glow on hover. Default: false */
  glow?: boolean;
  /** Card padding. Default: 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** HTML element tag. Default: 'div' */
  as?: GlassCardElement;
  /** Makes the card interactive with pointer cursor and active state */
  onClick?: () => void;
}

// ─── Padding Map ─────────────────────────────────────────────────────────────

const paddingStyles: Record<NonNullable<GlassCardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6 sm:p-8',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      hover = true,
      glow = false,
      padding = 'md',
      as: _as = 'div',
      onClick,
      ...motionProps
    },
    ref
  ) => {
    // Determine the motion component based on 'as' prop
    const Component =
      _as === 'section' ? motion.section : _as === 'article' ? motion.article : motion.div;

    return (
      <Component
        ref={ref}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={cn(
          // Base glass styles
          'rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]',
          '[backdrop-filter:blur(var(--glass-blur))] [-webkit-backdrop-filter:blur(var(--glass-blur))]',
          'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          // Light mode: visible border + soft shadow so cards stand out on white bg
          'shadow-[var(--shadow-sm)]',

          // Padding
          paddingStyles[padding],

          // Hover effects
          hover && [
            'hover:border-[var(--glass-border-hover)]',
            'hover:bg-[var(--glass-bg-hover)]',
            'hover:-translate-y-px',
            'hover:shadow-[var(--shadow-md)]',
          ],

          // Glow on hover
          glow && 'hover:shadow-[var(--shadow-glow)]',

          // Interactive (clickable)
          onClick && 'cursor-pointer active:scale-[0.98]',

          className
        )}
        {...motionProps}
      >
        {children}
      </Component>
    );
  }
);

GlassCard.displayName = 'GlassCard';
