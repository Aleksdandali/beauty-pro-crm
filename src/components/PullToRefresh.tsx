"use client";

import { RefreshCw, ArrowDown } from "lucide-react";

type Props = {
  isRefreshing: boolean;
  pullDistance: number;
  threshold?: number;
};

export function PullToRefreshIndicator({ isRefreshing, pullDistance, threshold = 100 }: Props) {
  const progress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold;

  return (
    <>
      {/* Overlay що показує прогрес */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-end overflow-hidden pointer-events-none"
        style={{ 
          height: `${pullDistance}px`,
          transition: isRefreshing ? 'none' : pullDistance === 0 ? 'height 0.3s ease-out' : 'none'
        }}
      >
        {/* Градієнт фон */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent"
          style={{ opacity: progress }}
        />
        
        {/* Індикатор */}
        <div 
          className={`mb-4 p-3 rounded-full transition-all duration-200 ${
            isReady || isRefreshing
              ? 'bg-violet-600 text-white scale-110' 
              : 'bg-white dark:bg-[#1a1a1a] text-violet-600 border border-gray-200 dark:border-white/10'
          } ${isRefreshing ? 'animate-pulse' : ''}`}
          style={{
            transform: `scale(${0.8 + progress * 0.4})`,
            boxShadow: isReady ? '0 0 20px rgba(139, 92, 246, 0.5)' : '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {isRefreshing ? (
            <RefreshCw size={24} className="animate-spin" />
          ) : isReady ? (
            <RefreshCw size={24} />
          ) : (
            <ArrowDown 
              size={24} 
              style={{ transform: `rotate(${progress * 180}deg)` }}
            />
          )}
        </div>
        
        {/* Текст */}
        <p 
          className={`text-xs font-medium mb-2 transition-colors ${
            isReady || isRefreshing
              ? 'text-violet-600 dark:text-violet-400' 
              : 'text-gray-400'
          }`}
        >
          {isRefreshing ? 'Оновлення...' : isReady ? 'Відпустіть' : 'Потягніть вниз'}
        </p>
      </div>
    </>
  );
}

// Обгортка для контенту що рухається
export function PullToRefreshWrapper({ 
  children, 
  pullDistance, 
  isRefreshing 
}: { 
  children: React.ReactNode;
  pullDistance: number;
  isRefreshing: boolean;
}) {
  return (
    <div 
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing ? 'none' : pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {children}
    </div>
  );
}
