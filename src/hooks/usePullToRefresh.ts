import { useState, useEffect, useCallback, useRef } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const triggeredHaptic = useRef(false);
  
  const THRESHOLD = 100;

  // Вібрація
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    // iOS Haptic (якщо доступно)
    if ('ontouchstart' in window && (window as any).Taptic) {
      (window as any).Taptic.impact({ style: 'light' });
    }
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY <= 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      triggeredHaptic.current = false;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && window.scrollY <= 0) {
      // Еластичний ефект — чим далі тягнеш, тим важче
      const elasticDistance = Math.pow(distance, 0.7);
      setPullDistance(Math.min(elasticDistance, 150));
      
      // Вібрація при досягненні порогу
      if (elasticDistance >= THRESHOLD && !triggeredHaptic.current) {
        vibrate(15);
        triggeredHaptic.current = true;
      }
      if (elasticDistance < THRESHOLD && triggeredHaptic.current) {
        triggeredHaptic.current = false;
      }
      
      // Блокуємо скрол
      e.preventDefault();
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      vibrate([10, 50, 20]); // Подвійна вібрація при рефреші
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance, threshold: THRESHOLD };
}
