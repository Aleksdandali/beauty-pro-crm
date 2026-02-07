'use client';

import { Crown, Heart, User, UserPlus, Moon, UserX } from 'lucide-react';
import { GlassBadge } from '@/components/glass';
import { RFM_SEGMENTS, type RFMSegment } from '@/lib/rfm-engine';

const SEGMENT_ICONS: Record<RFMSegment, React.ReactNode> = {
  vip: <Crown className="h-3 w-3" />,
  loyal: <Heart className="h-3 w-3" />,
  regular: <User className="h-3 w-3" />,
  new: <UserPlus className="h-3 w-3" />,
  sleeping: <Moon className="h-3 w-3" />,
  lost: <UserX className="h-3 w-3" />,
};

interface RFMBadgeProps {
  segment: RFMSegment;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function RFMBadge({ segment, size = 'sm', showIcon = true }: RFMBadgeProps) {
  const info = RFM_SEGMENTS[segment];
  if (!info) return null;

  return (
    <GlassBadge
      variant={info.badgeVariant as 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost'}
      size={size}
    >
      {showIcon && SEGMENT_ICONS[segment]}
      {info.label}
    </GlassBadge>
  );
}
