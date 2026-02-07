'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimerDisplay } from '@/lib/sterilization-utils';

interface CycleTimerProps {
  /** Duration in minutes */
  durationMinutes: number;
  /** Whether timer is active */
  isRunning: boolean;
  /** Called when user presses Start */
  onStart: () => void;
  /** Called when timer completes or user presses Stop */
  onComplete: () => void;
  /** Label above timer */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Toast message when timer completes */
  completionMessage?: string;
}

const SIZES = {
  sm: { ring: 120, stroke: 6, textClass: 'text-2xl' },
  md: { ring: 180, stroke: 8, textClass: 'text-4xl' },
  lg: { ring: 240, stroke: 10, textClass: 'text-5xl' },
};

// ─── Web Audio API notification sound ────────────────────────────────────────

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 0;
    }, 200);
    setTimeout(() => {
      osc.frequency.value = 880;
    }, 400);
    setTimeout(() => {
      osc.frequency.value = 0;
    }, 600);
    setTimeout(() => {
      osc.frequency.value = 1100;
    }, 800);
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 1100);
  } catch {
    // Audio not available
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CycleTimer({
  durationMinutes,
  isRunning,
  onStart,
  onComplete,
  label,
  size = 'md',
  completionMessage,
}: CycleTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [flashCount, setFlashCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundPlayedRef = useRef(false);

  // Mute state from localStorage
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sterilization_timer_muted') === 'true';
  });

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('sterilization_timer_muted', String(next));
  };

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const isComplete = remaining <= 0 && started;

  const { ring: ringSize, stroke, textClass } = SIZES[size];
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  // Tick
  useEffect(() => {
    if (isRunning && started && !isComplete) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            return totalSeconds;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, started, isComplete, totalSeconds]);

  // Auto-play sound + flash when timer reaches 0
  useEffect(() => {
    if (isComplete && started && !soundPlayedRef.current) {
      soundPlayedRef.current = true;

      // Play sound if not muted
      if (!muted) {
        playNotificationSound();
      }

      // Flash green 3 times
      let count = 0;
      flashRef.current = setInterval(() => {
        count++;
        setFlashCount(count);
        if (count >= 6) {
          if (flashRef.current) clearInterval(flashRef.current);
          setFlashCount(0);
        }
      }, 300);
    }

    return () => {
      if (flashRef.current) clearInterval(flashRef.current);
    };
  }, [isComplete, started, muted]);

  const handleStart = useCallback(() => {
    setStarted(true);
    setElapsed(0);
    soundPlayedRef.current = false;
    setFlashCount(0);
    onStart();
  }, [onStart]);

  const handleComplete = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (flashRef.current) clearInterval(flashRef.current);
    setStarted(false);
    setFlashCount(0);
    onComplete();
  }, [onComplete]);

  // Flashing ring color
  const isFlashing = flashCount > 0 && flashCount % 2 === 1;
  const ringColor = isComplete ? (isFlashing ? '#10b981' : '#059669') : '#8b5cf6';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {label && <p className="text-muted-foreground text-sm font-medium">{label}</p>}
        <button
          onClick={toggleMute}
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          title={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* SVG Ring */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth={stroke}
          />
          {/* Progress ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'text-foreground font-mono font-bold transition-colors',
              textClass,
              isComplete && isFlashing && 'text-emerald-500'
            )}
          >
            {formatTimerDisplay(remaining)}
          </span>
          {started && !isComplete && (
            <span className="text-muted-foreground mt-1 animate-pulse text-xs">Активний</span>
          )}
          {isComplete && (
            <span className="mt-1 text-xs font-medium text-emerald-500">
              {completionMessage || 'Завершено!'}
            </span>
          )}
        </div>

        {/* Pulsing ring when active */}
        {started && !isComplete && (
          <div
            className="absolute inset-0 animate-ping rounded-full border-2 border-violet-500/30"
            style={{ animationDuration: '2s' }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!started ? (
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
          >
            <Play className="h-4 w-4" />
            Старт
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
              isComplete
                ? 'animate-pulse bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)]'
            )}
          >
            <Square className="h-4 w-4" />
            {isComplete ? 'Підтвердити завершення' : 'Зупинити'}
          </button>
        )}
      </div>
    </div>
  );
}
