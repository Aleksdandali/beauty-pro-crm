'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CountUpProps {
  /** Target number */
  end: number;
  /** Starting number. Default: 0 */
  start?: number;
  /** Animation duration in ms. Default: 1200 */
  duration?: number;
  /** Delay before start in ms. Default: 0 */
  delay?: number;
  /** Decimal places. Default: 0 */
  decimals?: number;
  /** Thousands separator. Default: ' ' (UA standard) */
  separator?: string;
  /** Prefix before number, e.g. "₴" */
  prefix?: string;
  /** Suffix after number, e.g. "%" */
  suffix?: string;
  className?: string;
  /** Only animate once. Default: true */
  once?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Ease-out cubic: fast start, natural deceleration */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Format number with custom separator: 47250 → "47 250" */
function formatWithSeparator(value: number, decimals: number, separator: string): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  // Add separator every 3 digits from right
  const formatted = (intPart ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

// ─── Component ───────────────────────────────────────────────────────────────
// Uses direct DOM textContent updates via ref for performance (no setState in rAF loop)

export const CountUp = forwardRef<HTMLSpanElement, CountUpProps>(
  (
    {
      end,
      start = 0,
      duration = 1200,
      delay = 0,
      decimals = 0,
      separator = '\u00A0', // non-breaking space (UA standard)
      prefix = '',
      suffix = '',
      className,
      once = true,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLSpanElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLSpanElement>) ?? internalRef;
    const isInView = useInView(resolvedRef, { once });
    const prefersReduced = useReducedMotion();

    const rafRef = useRef<number>(0);
    const hasAnimated = useRef(false);

    // Direct DOM update — avoids setState in rAF loop and in effects
    const updateDisplay = useCallback(
      (value: number) => {
        const el = resolvedRef.current;
        if (!el) return;
        el.textContent = `${prefix}${formatWithSeparator(value, decimals, separator)}${suffix}`;
      },
      [resolvedRef, prefix, suffix, decimals, separator]
    );

    const animate = useCallback(() => {
      if (once && hasAnimated.current) return;

      const startTime = performance.now() + delay;
      hasAnimated.current = true;

      function tick(now: number) {
        const elapsed = now - startTime;

        if (elapsed < 0) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = start + (end - start) * eased;

        updateDisplay(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }, [start, end, duration, delay, once, updateDisplay]);

    useEffect(() => {
      if (prefersReduced) {
        // Reduced motion: show final value immediately via DOM
        updateDisplay(end);
        return;
      }

      if (isInView) {
        animate();
      }

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [isInView, animate, prefersReduced, end, updateDisplay]);

    // Initial render text (SSR and before animation)
    const initialFormatted = `${prefix}${formatWithSeparator(start, decimals, separator)}${suffix}`;

    return (
      <span ref={resolvedRef} className={cn('font-mono-numbers', className)}>
        {initialFormatted}
      </span>
    );
  }
);

CountUp.displayName = 'CountUp';
