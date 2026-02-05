"use client";

import { RefreshCw } from "lucide-react";

type Props = {
  isRefreshing: boolean;
  pullDistance: number;
};

export function PullToRefreshIndicator({ isRefreshing, pullDistance }: Props) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = isRefreshing ? 0 : pullDistance * 2;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, 100)}px)`,
        opacity: progress 
      }}
    >
      <div className={`p-3 rounded-full bg-white dark:bg-[#111111] shadow-lg border border-gray-200 dark:border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}>
        <RefreshCw 
          size={24} 
          className="text-violet-600"
          style={{ transform: isRefreshing ? 'none' : `rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  );
}
