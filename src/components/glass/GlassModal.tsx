'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GlassModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Optional title in the header */
  title?: string;
  /** Optional description below title */
  description?: string;
  children: React.ReactNode;
  /** Modal width. Default: 'md' */
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

// ─── Size Map ────────────────────────────────────────────────────────────────

const sizeStyles: Record<NonNullable<GlassModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-4xl sm:max-w-4xl',
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Mobile full-screen: slide up from bottom
const mobileFullVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2 },
  },
};

// ─── Focus Trap Hook ─────────────────────────────────────────────────────────

function useFocusTrap(open: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus the first focusable element
    const firstFocusable = container.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return;

      const focusable = container.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return containerRef;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const GlassModal = forwardRef<HTMLDivElement, GlassModalProps>(
  ({ open, onClose, title, description, children, size = 'md', className }, ref) => {
    const focusRef = useFocusTrap(open);

    // ESC to close
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose]
    );

    useEffect(() => {
      if (!open) return;
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [open, handleKeyDown]);

    const isFull = size === 'full';

    return (
      <AnimatePresence>
        {open && (
          <div
            ref={ref}
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            style={{ zIndex: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Modal'}
          >
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <motion.div
              ref={focusRef}
              className={cn(
                'relative z-10 flex w-full flex-col',
                // Glass effect
                'border border-[var(--glass-border)] bg-[var(--elevated)]',
                '[backdrop-filter:blur(var(--glass-blur-heavy))] [-webkit-backdrop-filter:blur(var(--glass-blur-heavy))]',
                // Size
                sizeStyles[size],
                // Mobile full: full height bottom sheet
                isFull
                  ? 'h-[calc(100dvh-2rem)] rounded-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-xl'
                  : 'max-h-[85vh] rounded-xl',
                className
              )}
              variants={isFull ? mobileFullVariants : modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              {(title || description) && (
                <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    {title && <h2 className="text-text-primary text-lg font-semibold">{title}</h2>}
                    {description && (
                      <p className="text-text-secondary mt-1 text-sm">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className={cn(
                      'ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      'text-text-muted transition-colors duration-150',
                      'hover:text-text-primary hover:bg-[var(--glass-bg-hover)]'
                    )}
                    aria-label="Закрити"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Close button when no header */}
              {!title && !description && (
                <button
                  onClick={onClose}
                  className={cn(
                    'absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg',
                    'text-text-muted transition-colors duration-150',
                    'hover:text-text-primary hover:bg-[var(--glass-bg-hover)]'
                  )}
                  aria-label="Закрити"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

GlassModal.displayName = 'GlassModal';
